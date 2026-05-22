/**
 * Redistribui destinos das viagens NÃO finalizadas pra ~15 km da origem,
 * em direções (bearings) bem espalhadas pra dar variedade visual.
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

async function reverseGeocode(lat: number, lng: number): Promise<Feature | null> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?access_token=${TOKEN}&country=BR&limit=1&language=pt&types=address,place,neighborhood`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = (await r.json()) as { features?: Feature[] };
  return j.features?.[0] ?? null;
}

async function main(): Promise<void> {
  if (!TOKEN) {
    console.error('MAPBOX_TOKEN não setada');
    process.exit(1);
  }

  const viagens = await prisma.viagem.findMany({
    where: {
      dataExclusao: null,
      status: { in: ['CRIADA', 'EM_ANDAMENTO'] },
      origemLatitude: { not: null },
      origemLongitude: { not: null },
    },
    select: {
      id: true,
      status: true,
      origemLatitude: true,
      origemLongitude: true,
    },
  });

  console.log(`${viagens.length} viagens a redistribuir (15 km exatos)`);

  // Bearings bem espalhados — 6 cardinais com offset pra evitar 0/90/180/270
  // que tendem a cair em ruas longas com mesmo nome
  const BEARINGS = [30, 90, 150, 210, 270, 330];

  for (let i = 0; i < viagens.length; i++) {
    const v = viagens[i];
    const origemLat = Number(v.origemLatitude);
    const origemLng = Number(v.origemLongitude);
    const bearingBase = BEARINGS[i % BEARINGS.length];

    // Tenta o bearing principal e até 3 offsets de +20° caso a reverse
    // geocode retorne nada (mar, zona rural)
    let geo: Feature | null = null;
    let bearingFinal = bearingBase;
    for (let t = 0; t < 4 && !geo; t++) {
      const b = (bearingBase + t * 20) % 360;
      const pt = pontoDistante(origemLat, origemLng, DIST_KM, b);
      geo = await reverseGeocode(pt.latitude, pt.longitude);
      if (geo) bearingFinal = b;
    }

    if (!geo) {
      console.log(`  [${v.id.slice(0, 8)}] ${v.status} ✗ sem endereço`);
      continue;
    }

    await prisma.viagem.update({
      where: { id: v.id },
      data: {
        destino: geo.place_name,
        destinoLatitude: geo.center[1],
        destinoLongitude: geo.center[0],
        rotaGeometria: null,
        rotaDistanciaKm: null,
        rotaDuracaoMin: null,
      },
    });

    console.log(
      `  [${v.id.slice(0, 8)}] ${v.status} · bearing ${bearingFinal}° · ${geo.place_name.slice(0, 70)}`,
    );
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
