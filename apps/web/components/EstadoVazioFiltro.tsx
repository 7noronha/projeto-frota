interface EstadoVazioFiltroProps {
  onLimpar: () => void;
}

export function EstadoVazioFiltro({ onLimpar }: EstadoVazioFiltroProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <i className="pi pi-search" style={{ fontSize: '2rem', color: '#94a3b8' }} />
      <h3 className="mt-3 text-sm font-semibold" style={{ color: '#1e293b' }}>
        Nenhum resultado
      </h3>
      <p className="mt-1 max-w-sm text-sm" style={{ color: '#64748b' }}>
        Os filtros aplicados não retornaram resultados. Tente ajustar ou limpar os filtros.
      </p>
      <button
        type="button"
        onClick={onLimpar}
        className="mt-4 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
        style={{
          borderColor: '#e2e8f0',
          color: '#374151',
          background: 'white',
          cursor: 'pointer',
        }}
      >
        Limpar filtros
      </button>
    </div>
  );
}
