/**
 * Script one-off: geocoda origem (sede) + redistribui destino entre 15-20 km
 * pra todas as viagens NÃO finalizadas.
 *
 * Usado pra preparar dados de teste em produção quando o MAPBOX_TOKEN
 * ainda não está setado no servidor — fazemos tudo daqui com o token local.
 *
 * Uso:
 *   DATABASE_URL="postgresql://..." bunx tsx scripts/backfill-prod.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TOKEN = process.env.MAPBOX_TOKEN;

if (!TOKEN) {
  console.error('MAPBOX_TOKEN não configurada no .env local');
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

function pontoDistante(lat: number, lng: number, dKm: number, bearingDeg: number) {
  const d = dKm / R_TERRA;
  const latR = rad(lat);
  const lngR = rad(lng);
  const brR = rad(bearingDeg);
  const lat2 = Math.asin(Math.sin(latR) * Math.cos(d) + Math.cos(latR) * Math.sin(d) * Math.cos(brR));
  const lng2 =
    lngR + Math.atan2(Math.sin(brR) * Math.sin(d) * Math.cos(latR), Math.cos(d) - Math.sin(latR) * Math.sin(lat2));
  return { latitude: deg(lat2), longitude: deg(lng2) };
}

interface MapboxFeature {
  place_name: string;
  center: [number, number];
}

async function geocodar(endereco: string): Promise<MapboxFeature | null> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endereco)}.json` +
    `?access_token=${TOKEN}&country=BR&limit=1&language=pt`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = (await r.json()) as { features?: MapboxFeature[] };
  return j.features?.[0] ?? null;
}

async function reverseGeocode(lat: number, lng: number): Promise<MapboxFeature | null> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?access_token=${TOKEN}&country=BR&limit=1&language=pt&types=address,place,neighborhood`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = (await r.json()) as { features?: MapboxFeature[] };
  return j.features?.[0] ?? null;
}

async function main(): Promise<void> {
  const viagens = await prisma.viagem.findMany({
    where: {
      dataExclusao: null,
      status: { in: ['CRIADA', 'EM_ANDAMENTO'] },
    },
    select: {
      id: true,
      origem: true,
      destino: true,
      origemLatitude: true,
      origemLongitude: true,
      status: true,
    },
  });

  console.log(`Encontradas ${viagens.length} viagens (CRIADA/EM_ANDAMENTO).`);

  let sucesso = 0;
  let falha = 0;

  for (const v of viagens) {
    console.log(`\n[${v.id.slice(0, 8)}] ${v.status}`);

    // 1. Geocoda origem se necessário
    let origemLat: number;
    let origemLng: number;
    if (v.origemLatitude == null || v.origemLongitude == null) {
      console.log(`  → geocodando origem: "${v.origem.slice(0, 50)}..."`);
      const geo = await geocodar(v.origem);
      if (!geo) {
        console.log('    ✗ falhou — pulando viagem');
        falha++;
        continue;
      }
      origemLng = geo.center[0];
      origemLat = geo.center[1];
      console.log(`    ✓ ${geo.place_name.slice(0, 60)}`);
    } else {
      origemLat = Number(v.origemLatitude);
      origemLng = Number(v.origemLongitude);
    }

    // 2. Calcula destino aleatório (determinístico por id) entre 15-20 km
    const seedNum = parseInt(v.id.replace(/-/g, '').slice(0, 8), 16);
    const distKm = DIST_MIN_KM + ((seedNum % 1000) / 1000) * (DIST_MAX_KM - DIST_MIN_KM);
    const bearing = (seedNum * 31) % 360;
    const novoPt = pontoDistante(origemLat, origemLng, distKm, bearing);

    // 3. Reverse geocode (tenta 3 bearings se primeiro falhar)
    let destGeo: MapboxFeature | null = null;
    let ptUsado = novoPt;
    for (let tent = 0; tent < 3 && !destGeo; tent++) {
      const pt =
        tent === 0
          ? novoPt
          : pontoDistante(origemLat, origemLng, distKm, (bearing + 120 * tent) % 360);
      destGeo = await reverseGeocode(pt.latitude, pt.longitude);
      if (destGeo) ptUsado = pt;
    }
    if (!destGeo) {
      console.log(`  ✗ sem endereço próximo a ${distKm.toFixed(1)}km — pulando`);
      falha++;
      continue;
    }

    // 4. Atualiza no banco — sede coords + novo destino + invalida rota
    await prisma.viagem.update({
      where: { id: v.id },
      data: {
        origemLatitude: origemLat,
        origemLongitude: origemLng,
        destino: destGeo.place_name,
        destinoLatitude: destGeo.center[1],
        destinoLongitude: destGeo.center[0],
        rotaGeometria: null,
        rotaDistanciaKm: null,
        rotaDuracaoMin: null,
      },
    });

    console.log(
      `  ✓ destino @ ${distKm.toFixed(1)}km · ${destGeo.place_name.slice(0, 60)}`,
    );
    sucesso++;
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Resultado: ${sucesso} sucesso, ${falha} falhas`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
