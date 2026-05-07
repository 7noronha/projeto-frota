import { Icon, Button } from '@minha-empresa/components-react';

interface EstadoVazioFiltroProps {
  onLimpar: () => void;
}

export function EstadoVazioFiltro({ onLimpar }: EstadoVazioFiltroProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <Icon name="PiMagnifyingGlassBold" size="xl" color="contentTernary" />
      <h3 className="mt-3 text-sm font-semibold" style={{ color: '#1e293b' }}>
        Nenhum resultado
      </h3>
      <p className="mt-1 max-w-sm text-sm" style={{ color: '#64748b' }}>
        Os filtros aplicados não retornaram resultados. Tente ajustar ou limpar os filtros.
      </p>
      <Button
        variant="outline"
        color="default"
        size="sm"
        className="mt-4"
        onClick={onLimpar}
        type="button"
      >
        Limpar filtros
      </Button>
    </div>
  );
}
