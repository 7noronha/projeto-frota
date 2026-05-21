import Image from 'next/image';

/**
 * Hero visual da tela de login.
 *
 * Como trocar a foto:
 * 1. Salve uma imagem 1:1 (recomendado 920×920px) em
 *    `apps/web/public/images/login.png`.
 * 2. Converta para WebP (qualidade 82) com:
 *    `bunx sharp-cli -i apps/web/public/images/login.png -o apps/web/public/images/ -f webp -q 82`
 * 3. Pronto — o componente já aponta pra `login.webp`.
 *
 * Se o arquivo não existir, o Next/Image vai retornar 404 mas o layout
 * mantém o espaço reservado (sem quebrar). Caia para o SVG legado
 * (`IlustracaoAuthLegado` abaixo) caso queira reverter sem perder o
 * desenho anterior.
 */
export function IlustracaoAuth() {
  return (
    <div
      style={{
        width: '100%',
        // Proporção ajustada pra casar com a altura do card de login
        // (cabeçalho + 2 inputs + botão + divisor + info box ≈ 500px).
        // A foto original é 1:1, então recebe leve crop top/bottom via cover.
        aspectRatio: '21 / 25',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 12px 48px rgba(0, 50, 120, 0.18)',
        position: 'relative',
        background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
      }}
      aria-hidden="true"
    >
      <Image
        src="/images/login.webp"
        alt=""
        fill
        sizes="(min-width: 1024px) 420px, 0px"
        priority
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}

/**
 * Versão anterior da ilustração — frota desenhada em SVG.
 * Mantida como fallback. Para reverter ao SVG, troque `IlustracaoAuth`
 * por `IlustracaoAuthLegado` em `page.tsx`.
 */
export function IlustracaoAuthLegado() {
  return (
    <svg
      viewBox="0 0 520 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 460, height: 'auto' }}
      aria-hidden="true"
    >
      {/* ── Blobs decorativos de fundo ─────────────────────────────────────── */}
      <ellipse cx="140" cy="200" rx="130" ry="130" fill="#dbeafe" opacity="0.5" />
      <ellipse cx="380" cy="320" rx="100" ry="100" fill="#bfdbfe" opacity="0.4" />
      <ellipse cx="300" cy="100" rx="80" ry="80" fill="#eff6ff" opacity="0.7" />

      {/* ── Mapa / fundo de estrada ────────────────────────────────────────── */}
      <rect x="40" y="310" width="440" height="36" rx="18" fill="#e2e8f0" />
      <rect x="40" y="322" width="440" height="12" rx="6" fill="#cbd5e1" />
      {[60, 120, 180, 240, 300, 360, 420].map((x) => (
        <rect key={x} x={x} y="326" width="36" height="4" rx="2" fill="white" opacity="0.7" />
      ))}

      <rect x="230" y="160" width="36" height="160" rx="18" fill="#e2e8f0" />
      <rect x="242" y="160" width="12" height="160" rx="6" fill="#cbd5e1" />

      {/* ── Rota / GPS path ────────────────────────────────────────────────── */}
      <path
        d="M90 328 Q90 240 180 200 Q260 160 260 100"
        stroke="#0066FF"
        strokeWidth="3"
        strokeDasharray="8 5"
        fill="none"
        opacity="0.5"
      />

      {/* ── Pin de origem ──────────────────────────────────────────────────── */}
      <g transform="translate(72, 290)">
        <circle cx="18" cy="18" r="18" fill="#0066FF" />
        <circle cx="18" cy="18" r="9" fill="white" />
        <circle cx="18" cy="18" r="4" fill="#0066FF" />
      </g>

      {/* ── Pin de destino ─────────────────────────────────────────────────── */}
      <g transform="translate(243, 58)">
        <path d="M17 0 C7.6 0 0 7.6 0 17 C0 29.8 17 44 17 44 C17 44 34 29.8 34 17 C34 7.6 26.4 0 17 0Z" fill="#0066FF" />
        <circle cx="17" cy="17" r="8" fill="white" />
        <circle cx="17" cy="17" r="4" fill="#0066FF" />
      </g>

      {/* ── Caminhão grande (veículo principal) ───────────────────────────── */}
      <g transform="translate(130, 278)">
        <rect x="0" y="8" width="90" height="40" rx="6" fill="#0066FF" />
        <rect x="68" y="0" width="40" height="40" rx="6" fill="#0047B3" />
        <rect x="74" y="6" width="26" height="18" rx="4" fill="#bfdbfe" opacity="0.9" />
        <rect x="104" y="26" width="6" height="6" rx="1" fill="#fef08a" />
        <rect x="104" y="10" width="4" height="14" rx="1" fill="#1e3a8a" opacity="0.5" />
        <rect x="6" y="16" width="56" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
        <rect x="6" y="26" width="56" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
        <rect x="6" y="36" width="56" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
        <rect x="20" y="20" width="24" height="8" rx="2" fill="rgba(255,255,255,0.15)" />
        <circle cx="22" cy="50" r="12" fill="#1e293b" />
        <circle cx="22" cy="50" r="6" fill="#475569" />
        <circle cx="22" cy="50" r="2" fill="#94a3b8" />
        <circle cx="84" cy="50" r="12" fill="#1e293b" />
        <circle cx="84" cy="50" r="6" fill="#475569" />
        <circle cx="84" cy="50" r="2" fill="#94a3b8" />
        <circle cx="100" cy="50" r="12" fill="#1e293b" />
        <circle cx="100" cy="50" r="6" fill="#475569" />
        <circle cx="100" cy="50" r="2" fill="#94a3b8" />
      </g>

      {/* ── Carro menor (veículo secundário) ─────────────────────────────── */}
      <g transform="translate(330, 288)">
        <rect x="0" y="14" width="80" height="28" rx="8" fill="#60a5fa" />
        <path d="M14 14 Q18 2 62 2 Q66 2 70 14Z" fill="#93c5fd" />
        <path d="M16 14 Q20 6 42 6 L42 14Z" fill="#dbeafe" opacity="0.9" />
        <path d="M44 6 Q60 6 64 14 L44 14Z" fill="#dbeafe" opacity="0.9" />
        <rect x="72" y="20" width="8" height="6" rx="2" fill="#fef08a" />
        <circle cx="18" cy="44" r="10" fill="#1e293b" />
        <circle cx="18" cy="44" r="5" fill="#475569" />
        <circle cx="62" cy="44" r="10" fill="#1e293b" />
        <circle cx="62" cy="44" r="5" fill="#475569" />
      </g>

      {/* ── Card de dashboard flutuante ───────────────────────────────────── */}
      <g transform="translate(46, 110)">
        <rect x="0" y="0" width="150" height="90" rx="14" fill="white" />
        <rect x="0" y="0" width="150" height="90" rx="14" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="4" y="4" width="150" height="90" rx="14" fill="rgba(0,0,0,0.04)" style={{ transform: 'translateZ(-1px)' }} />
        <rect x="12" y="12" width="60" height="8" rx="4" fill="#94a3b8" />
        <rect x="12" y="12" width="36" height="8" rx="4" fill="#cbd5e1" />
        <text x="12" y="46" fontSize="22" fontWeight="700" fill="#0A2540" fontFamily="Inter, sans-serif">12</text>
        <rect x="38" y="30" width="28" height="12" rx="6" fill="#dcfce7" />
        <rect x="42" y="33" width="20" height="6" rx="3" fill="#86efac" />
        {[
          { h: 20, x: 12 },
          { h: 32, x: 24 },
          { h: 16, x: 36 },
          { h: 40, x: 48 },
          { h: 28, x: 60 },
          { h: 36, x: 72 },
        ].map((bar) => (
          <rect
            key={bar.x}
            x={bar.x}
            y={78 - bar.h}
            width="8"
            height={bar.h}
            rx="3"
            fill={bar.h === 40 ? '#0066FF' : '#bfdbfe'}
          />
        ))}
        <rect x="90" y="58" width="48" height="6" rx="3" fill="#e2e8f0" />
        <rect x="90" y="68" width="32" height="6" rx="3" fill="#e2e8f0" />
        <rect x="90" y="78" width="40" height="6" rx="3" fill="#e2e8f0" />
      </g>

      {/* ── Card de status flutuante ──────────────────────────────────────── */}
      <g transform="translate(330, 150)">
        <rect x="0" y="0" width="148" height="70" rx="14" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        <circle cx="24" cy="24" r="16" fill="#eff6ff" />
        <rect x="12" y="20" width="18" height="10" rx="2" fill="#0066FF" />
        <rect x="26" y="16" width="10" height="10" rx="2" fill="#0047B3" />
        <circle cx="16" cy="32" r="3" fill="#1e293b" />
        <circle cx="31" cy="32" r="3" fill="#1e293b" />
        <rect x="46" y="12" width="88" height="8" rx="4" fill="#0A2540" opacity="0.8" />
        <rect x="46" y="26" width="60" height="6" rx="3" fill="#94a3b8" />
        <rect x="10" y="46" width="70" height="14" rx="7" fill="#dcfce7" />
        <rect x="18" y="50" width="54" height="6" rx="3" fill="#86efac" />
        <rect x="86" y="46" width="52" height="14" rx="7" fill="#eff6ff" />
        <rect x="92" y="50" width="40" height="6" rx="3" fill="#bfdbfe" />
      </g>

      {/* ── Notificação check ─────────────────────────────────────────────── */}
      <g transform="translate(200, 195)">
        <rect x="0" y="0" width="120" height="38" rx="19" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        <circle cx="22" cy="19" r="12" fill="#0066FF" />
        <path d="M16 19 L20 23 L28 14" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="40" y="10" width="68" height="7" rx="3.5" fill="#0A2540" opacity="0.75" />
        <rect x="40" y="22" width="44" height="6" rx="3" fill="#94a3b8" opacity="0.6" />
      </g>

      {/* ── Estrelinhas decorativas ───────────────────────────────────────── */}
      <g fill="#0066FF" opacity="0.25">
        <circle cx="48" cy="78" r="4" />
        <circle cx="62" cy="62" r="2.5" />
        <circle cx="38" cy="65" r="2" />
      </g>
      <g fill="#60a5fa" opacity="0.3">
        <circle cx="456" cy="130" r="4" />
        <circle cx="468" cy="118" r="2.5" />
        <circle cx="474" cy="134" r="2" />
      </g>
      <g fill="#0066FF" opacity="0.2">
        <circle cx="420" cy="270" r="4" />
        <circle cx="435" cy="258" r="2.5" />
        <circle cx="410" cy="258" r="2" />
      </g>
    </svg>
  );
}
