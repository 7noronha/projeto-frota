// Gera os assets de marca do app mobile FleetOps (ícone, ícone adaptativo,
// splash e favicon) a partir de SVGs vetoriais, rasterizando com sharp.
// O carro usa o glifo profissional "Car Profile (fill)" do Phosphor Icons
// (mesma família usada no painel web), garantindo qualidade de desenho.
// Rodar a partir de C:\www\frota (onde o sharp está instalado):
//   node scripts/gen-mobile-assets.mjs
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const SAIDA = 'C:/fleetops-mobile/assets';

const COR = {
  navy: '#0A2540',
  azulEscuro: '#0047B3',
  azul: '#0066FF',
  ciano: '#00C2FF',
  branco: '#FFFFFF',
};

// Phosphor "PiCarProfileFill" — viewBox nativo 0 0 256 256.
// bbox aproximado do desenho: x 0..240, y 64..192 -> centro (120, 128).
const CAR_PATH =
  'M240,112H211.31L168,68.69A15.86,15.86,0,0,0,156.69,64H44.28A16,16,0,0,0,31,71.12L1.34,115.56A8.07,8.07,0,0,0,0,120v48a16,16,0,0,0,16,16H33a32,32,0,0,0,62,0h66a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V128A16,16,0,0,0,240,112ZM44.28,80H156.69l32,32H23ZM64,192a16,16,0,1,1,16-16A16,16,0,0,1,64,192Zm128,0a16,16,0,1,1,16-16A16,16,0,0,1,192,192Z';

// Desenha o carro branco centralizado em (cx,cy) com a escala dada.
// O centro do glifo (120,128) é levado para (cx,cy).
function carro(cx, cy, escala) {
  return `<g transform="translate(${cx},${cy}) scale(${escala}) translate(-120,-128)"><path d="${CAR_PATH}" fill="${COR.branco}"/></g>`;
}

// ÍCONE PRINCIPAL (1024) — fundo degradê full-bleed + carro branco centralizado.
const svgIcone = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${COR.navy}"/>
      <stop offset="0.55" stop-color="${COR.azulEscuro}"/>
      <stop offset="1" stop-color="${COR.azul}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  ${carro(512, 524, 2.7)}
</svg>`;

// ÍCONE ADAPTATIVO (Android) — primeiro plano transparente; fundo (#0066FF)
// vem do app.json. Carro menor para respeitar a zona segura circular.
const svgAdaptativo = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${carro(512, 512, 2.3)}
</svg>`;

// SPLASH (1242) — transparente (navy #0A2540 vem do app.json), carro centralizado.
const svgSplash = `
<svg xmlns="http://www.w3.org/2000/svg" width="1242" height="1242" viewBox="0 0 1242 1242">
  ${carro(621, 621, 2.7)}
</svg>`;

async function gerar(nome, svg, tamanho) {
  const buf = await sharp(Buffer.from(svg)).resize(tamanho, tamanho).png().toBuffer();
  await writeFile(`${SAIDA}/${nome}`, buf);
  console.log(`gerado ${nome} (${tamanho}x${tamanho})`);
}

await gerar('icon.png', svgIcone, 1024);
await gerar('adaptive-icon.png', svgAdaptativo, 1024);
await gerar('splash-icon.png', svgSplash, 1242);
await gerar('favicon.png', svgIcone, 48);
console.log('OK');
