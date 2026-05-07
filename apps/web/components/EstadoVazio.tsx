import { Icon } from '@minha-empresa/components-react';
import type { IconType } from '@minha-empresa/components-react';

interface EstadoVazioProps {
  icone: IconType;
  titulo: string;
  descricao: string;
  cta?: React.ReactNode;
}

export function EstadoVazio({ icone, titulo, descricao, cta }: EstadoVazioProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg px-6 py-20 text-center"
      style={{
        border: '1.5px dashed #cbd5e1',
        background: '#f8fafc',
      }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 52, height: 52, background: '#f1f5f9' }}
      >
        <Icon name={icone} size="lg" color="contentTernary" />
      </div>
      <h3 className="mt-4 text-sm font-semibold" style={{ color: '#1e293b' }}>
        {titulo}
      </h3>
      <p className="mt-1 max-w-sm text-sm" style={{ color: '#64748b' }}>
        {descricao}
      </p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}
