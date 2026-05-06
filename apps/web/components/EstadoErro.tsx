'use client';

import { Button } from 'primereact/button';

interface EstadoErroProps {
  titulo?: string;
  descricao?: string;
  onTentarNovamente: () => void;
}

export function EstadoErro({
  titulo = 'Não conseguimos carregar os dados',
  descricao = 'Pode ser uma instabilidade temporária. Tente novamente em alguns instantes.',
  onTentarNovamente,
}: EstadoErroProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl px-6 py-14 text-center"
      style={{ border: '1px solid #fca5a5', background: '#fef2f2' }}
    >
      <i className="pi pi-exclamation-circle" style={{ fontSize: '2rem', color: '#ef4444' }} />
      <h3 className="mt-3 text-base font-semibold" style={{ color: '#1e293b' }}>
        {titulo}
      </h3>
      <p className="mt-1 max-w-sm text-sm" style={{ color: '#64748b' }}>
        {descricao}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button
          label="Tentar novamente"
          icon="pi pi-refresh"
          outlined
          size="small"
          onClick={onTentarNovamente}
        />
        <Button
          label="Falar com suporte"
          text
          size="small"
          onClick={() => {
            window.location.href = 'mailto:ti@empresa.com';
          }}
        />
      </div>
    </div>
  );
}
