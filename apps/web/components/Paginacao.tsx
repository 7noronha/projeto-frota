import Link from 'next/link';

interface PaginacaoProps {
  totalPaginas: number;
  paginaAtual: number;
  baseHref: string;
  params?: Record<string, string | undefined>;
}

export function Paginacao({ totalPaginas, paginaAtual, baseHref, params = {} }: PaginacaoProps) {
  if (totalPaginas <= 1) return null;

  const spBase = new URLSearchParams();
  for (const [chave, valor] of Object.entries(params)) {
    if (valor) spBase.set(chave, valor);
  }

  return (
    <nav aria-label="Paginação" className="mt-6 flex items-center justify-center gap-2">
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => {
        const sp = new URLSearchParams(spBase);
        sp.set('pagina', String(p));
        const ativo = p === paginaAtual;
        return (
          <Link
            key={p}
            href={`${baseHref}?${sp.toString()}`}
            aria-label={`Página ${p}${ativo ? ' (atual)' : ''}`}
            aria-current={ativo ? 'page' : undefined}
            className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium"
            style={{
              background: ativo ? '#0066FF' : 'white',
              color: ativo ? 'white' : '#374151',
              border: ativo ? 'none' : '1px solid #e2e8f0',
              textDecoration: 'none',
            }}
          >
            {p}
          </Link>
        );
      })}
    </nav>
  );
}
