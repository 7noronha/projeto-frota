/**
 * Script one-off: atualiza destinos de viagens NÃO finalizadas para um
 * endereço real ~15-20 km da origem.
 *
 * Útil pra preparar dados de teste do GPS sem ter viagens cruzando o
 * país. Ignora viagens FINALIZADAS (histórico não deve ser alterado).
 *
 * Uso: cd apps/api && bunx tsx scripts/redistribuir-destinos.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TOKEN = process.env.MAPBOX_TOKEN;

if (!TOKEN) {
  console.error('MAPBOX_TOKEN não configurada no .env');
  process.exit(1);
}

const DIST_MIN_KM = 15;
const DIST_MAX_KM = 20;
const R_TERRA = 6371;

function rad(g: number): number {
  return (g * Math.PI) / 180;
}
function deg(r: number): number {
  return (r * 180) / Math.PI;
}

/** Calcula um ponto a `dKm` quilômetros de (lat,lng) num bearing dado. */
function pontoDistante(lat: number, lng: number, dKm: number, bearingDeg: number) {
  const d = dKm / R_TERRA;
  const latR = rad(lat);
  const lngR = rad(lng);
  const brR = rad(bearingDeg);

  const lat2 = Math.asin(
    Math.sin(latR) * Math.cos(d) + Math.cos(latR) * Math.sin(d) * Math.cos(brR),
  );
  const lng2 =
    lngR + Math.atan2(Math.sin(brR) * Math.sin(d) * Math.cos(latR), Math.cos(d) - Math.sin(latR) * Math.sin(lat2));
  return { latitude: deg(lat2), longitude: deg(lng2) };
}

interface ReverseFeature {
  place_name: string;
  center: [number, number];
}

async function reverseGeocode(lat: number, lng: number): Promise<ReverseFeature | null> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?access_token=${TOKEN}&country=BR&limit=1&language=pt&types=address,place,neighborhood`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = (await r.json()) as { features?: ReverseFeature[] };
  return j.features?.[0] ?? null;
}

async function main(): Promise<void> {
  const viagens = await prisma.viagem.findMany({
    where: {
      dataExclusao: null,
      status: { in: ['CRIADA', 'EM_ANDAMENTO'] },
      origemLatitude: { not: null },
      origemLongitude: { not: null },
    },
    select: {
      id: true,
      destino: true,
      origem: true,
      origemLatitude: true,
      origemLongitude: true,
      status: true,
    },
  });

  console.log(`Encontradas ${viagens.length} viagens (CRIADA/EM_ANDAMENTO) com origem geocodada.`);

  let atualizadas = 0;
  let falhas = 0;

  for (const v of viagens) {
    const origemLat = Number(v.origemLatitude);
    const origemLng = Number(v.origemLongitude);

    // Distância e direção aleatórias (mas determinísticas por id pra reprodutibilidade)
    const seedNum = parseInt(v.id.replace(/-/g, '').slice(0, 8), 16);
    const distKm = DIST_MIN_KM + ((seedNum % 1000) / 1000) * (DIST_MAX_KM - DIST_MIN_KM);
    const bearing = (seedNum * 31) % 360;

    const novoPonto = pontoDistante(origemLat, origemLng, distKm, bearing);

    // Tenta até 3 bearings se o primeiro não retornar nada (zona rural,
    // mar, etc — sem endereços indexados na Mapbox)
    let geo: ReverseFeature | null = null;
    for (let tent = 0; tent < 3 && !geo; tent++) {
      const ptTentativa =
        tent === 0
          ? novoPonto
          : pontoDistante(origemLat, origemLng, distKm, (bearing + 120 * tent) % 360);
      geo = await reverseGeocode(ptTentativa.latitude, ptTentativa.longitude);
      if (geo) {
        novoPonto.latitude = ptTentativa.latitude;
        novoPonto.longitude = ptTentativa.longitude;
      }
    }

    if (!geo) {
      console.log(`  [${v.id.slice(0, 8)}] ✗ sem endereço próximo a ${distKm.toFixed(1)}km`);
      falhas++;
      continue;
    }

    await prisma.viagem.update({
      where: { id: v.id },
      data: {
        destino: geo.place_name,
        destinoLatitude: geo.center[1],
        destinoLongitude: geo.center[0],
        // Invalida rota cacheada — backfill em buscarPorId vai recalcular
        rotaGeometria: null,
        rotaDistanciaKm: null,
        rotaDuracaoMin: null,
      },
    });

    console.log(
      `  [${v.id.slice(0, 8)}] ✓ ${v.status} · ${distKm.toFixed(1)}km · ${geo.place_name.slice(0, 60)}`,
    );
    atualizadas++;
  }

  console.log(`\nResultado: ${atualizadas} atualizadas, ${falhas} falhas.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
