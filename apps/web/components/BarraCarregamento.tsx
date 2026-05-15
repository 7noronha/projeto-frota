import { Progress } from '@lojascem/components-react';

/**
 * Barra de progresso indeterminada fixa no topo da viewport.
 * Usada como fallback de Suspense (loading.tsx) durante navegação
 * entre rotas — estilo NProgress/YouTube. Substitui os skeletons
 * por um indicador único e consistente em toda a aplicação.
 */
export function BarraCarregamento(): React.ReactElement {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando página"
      className="fixed left-0 top-0 z-50 w-full"
    >
      <Progress size="sm" isBlock isIndeterminate />
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
