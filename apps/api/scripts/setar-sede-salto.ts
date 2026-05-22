/**
 * Define a sede como "Rodovia Engenheiro Ermenio de Oliveira Penteado,
 * SP-75, Salto, SP" e alinha todas as viagens com essa origem.
 * Usado no banco passado via DATABASE_URL.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TOKEN = process.env.MAPBOX_TOKEN;
const SEDE = 'Rodovia Engenheiro Ermenio de Oliveira Penteado, SP-75, Salto, SP';
const DIST_KM = 15;
const R = 6371;

const rad = (g: number): number => (g * Math.PI) / 180;
const deg = (r: number): number => (r * 180) / Math.PI;

function pontoDistante(lat: number, lng: number, dKm: number, brDeg: number) {
  const d = dKm / R;
  const latR = rad(lat);
  const lngR = rad(lng);
  const brR = rad(brDeg);
  const lat2 = Math.asin(
    Math.sin(latR) * Math.cos(d) + Math.cos(latR) * Math.sin(d) * Math.cos(brR),
  );
  const lng2 =
    lngR +
    Math.atan2(Math.sin(brR) * Math.sin(d) * Math.cos(latR), Math.cos(d) - Math.sin(latR) * Math.sin(lat2));
  return { latitude: deg(lat2), longitude: deg(lng2) };
}

interface Feature {
  place_name: string;
  center: [number, number];
}

async function geocodar(end: string): Promise<Feature | null> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(end)}.json` +
    `?access_token=${TOKEN}&country=BR&limit=1&language=pt`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = (await r.json()) as { features?: Feature[] };
  return j.features?.[0] ?? null;
}

async function reverse(lat: number, lng: number): Promise<Feature | null> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?access_token=${TOKEN}&country=BR&limit=5&language=pt&types=address`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = (await r.json()) as { features?: Feature[] };
  if (!j.features?.length) return null;
  const esp = j.features.find((f) => (f.place_name.match(/,/g) ?? []).length >= 3);
  return esp ?? j.features[0];
}

async function main(): Promise<void> {
  if (!TOKEN) {
    console.error('MAPBOX_TOKEN não setada');
    process.exit(1);
  }

  // 1. Geocoda a nova sede
  console.log(`Geocodando sede: "${SEDE}"`);
  const sedeGeo = await geocodar(SEDE);
  if (!sedeGeo) {
    console.error('Falha ao geocodar a sede');
    process.exit(1);
  }
  const sedeLat = sedeGeo.center[1];
  const sedeLng = sedeGeo.center[0];
  console.log(`  → ${sedeGeo.place_name}`);
  console.log(`  → ${sedeLat.toFixed(4)}, ${sedeLng.toFixed(4)}\n`);

  // 2. Upsert da config
  await prisma.configuracao.upsert({
    where: { chave: 'endereco_sede' },
    update: { valor: SEDE },
    create: { chave: 'endereco_sede', valor: SEDE },
  });
  console.log('Config endereco_sede atualizada.\n');

  // 3. Alinha todas as viagens
  const viagens = await prisma.viagem.findMany({
    where: { dataExclusao: null },
    select: { id: true, status: true },
  });
  console.log(`${viagens.length} viagens a alinhar`);

  const BEARINGS = [30, 90, 150, 210, 270, 330];

  for (let i = 0; i < viagens.length; i++) {
    const v = viagens[i];
    const brBase = BEARINGS[i % BEARINGS.length];

    let geo: Feature | null = null;
    let brFinal = brBase;
    for (let t = 0; t < 4 && !geo; t++) {
      const b = (brBase + t * 20) % 360;
      const pt = pontoDistante(sedeLat, sedeLng, DIST_KM, b);
      geo = await reverse(pt.latitude, pt.longitude);
      if (geo) brFinal = b;
    }
    if (!geo) {
      console.log(`  [${v.id.slice(0, 8)}] ${v.status} ✗`);
      continue;
    }

    await prisma.viagem.update({
      where: { id: v.id },
      data: {
        origem: SEDE,
        origemLatitude: sedeLat,
        origemLongitude: sedeLng,
        destino: geo.place_name,
        destinoLatitude: geo.center[1],
        destinoLongitude: geo.center[0],
        rotaGeometria: null,
        rotaDistanciaKm: null,
        rotaDuracaoMin: null,
      },
    });
    console.log(
      `  [${v.id.slice(0, 8)}] ${v.status.padEnd(13)} ${brFinal}° · ${geo.place_name.slice(0, 65)}`,
    );
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
