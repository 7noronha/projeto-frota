/**
 * Alinha o campo `origem` de todas as viagens com a sede do config
 * (configuracao.endereco_sede), re-geocoda e redistribui destinos
 * 15 km em direções espalhadas.
 *
 * Necessário quando a sede mudou no painel mas viagens antigas ficaram
 * com o texto da sede anterior (`origem` é cópia, não FK).
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TOKEN = process.env.MAPBOX_TOKEN;
const DIST_KM = 15;
const R = 6371;

const rad = (g: number): number => (g * Math.PI) / 180;
const deg = (r: number): number => (r * 180) / Math.PI;

function pontoDistante(lat: number, lng: number, dKm: number, bearingDeg: number) {
  const d = dKm / R;
  const latR = rad(lat);
  const lngR = rad(lng);
  const brR = rad(bearingDeg);
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

async function geocodar(endereco: string): Promise<Feature | null> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endereco)}.json` +
    `?access_token=${TOKEN}&country=BR&limit=1&language=pt`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = (await r.json()) as { features?: Feature[] };
  return j.features?.[0] ?? null;
}

async function reverseGeocode(lat: number, lng: number): Promise<Feature | null> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?access_token=${TOKEN}&country=BR&limit=5&language=pt&types=address`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = (await r.json()) as { features?: Feature[] };
  if (!j.features?.length) return null;
  const especifica = j.features.find((f) => (f.place_name.match(/,/g) ?? []).length >= 3);
  return especifica ?? j.features[0];
}

async function main(): Promise<void> {
  if (!TOKEN) {
    console.error('MAPBOX_TOKEN não setada');
    process.exit(1);
  }

  // 1. Lê a sede atual da config
  const sedeCfg = await prisma.configuracao.findFirst({
    where: { chave: 'endereco_sede' },
  });
  if (!sedeCfg) {
    console.error('Config endereco_sede não encontrada');
    process.exit(1);
  }
  console.log(`Sede config: "${sedeCfg.valor}"`);

  // 2. Geocoda a sede uma única vez
  const sedeGeo = await geocodar(sedeCfg.valor);
  if (!sedeGeo) {
    console.error('Falha ao geocodar a sede');
    process.exit(1);
  }
  const sedeLat = sedeGeo.center[1];
  const sedeLng = sedeGeo.center[0];
  console.log(`Sede geocodada: "${sedeGeo.place_name}" → ${sedeLat.toFixed(4)}, ${sedeLng.toFixed(4)}\n`);

  // 3. Atualiza todas as viagens com nova origem + novo destino
  const viagens = await prisma.viagem.findMany({
    where: { dataExclusao: null },
    select: { id: true, status: true },
  });
  console.log(`${viagens.length} viagens a alinhar com a sede`);

  const BEARINGS = [30, 90, 150, 210, 270, 330];

  for (let i = 0; i < viagens.length; i++) {
    const v = viagens[i];
    const brBase = BEARINGS[i % BEARINGS.length];

    // Tenta 4 offsets de bearing pra achar endereço de rua específico
    let geo: Feature | null = null;
    let brFinal = brBase;
    for (let t = 0; t < 4 && !geo; t++) {
      const b = (brBase + t * 20) % 360;
      const pt = pontoDistante(sedeLat, sedeLng, DIST_KM, b);
      geo = await reverseGeocode(pt.latitude, pt.longitude);
      if (geo) brFinal = b;
    }
    if (!geo) {
      console.log(`  [${v.id.slice(0, 8)}] ${v.status} ✗ sem endereço`);
      continue;
    }

    await prisma.viagem.update({
      where: { id: v.id },
      data: {
        origem: sedeCfg.valor,
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
      `  [${v.id.slice(0, 8)}] ${v.status.padEnd(13)} bearing ${brFinal}° · ${geo.place_name.slice(0, 70)}`,
    );
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
