import { HStack, VStack, Placeload } from '@lojascem/components-react';

interface TabelaSkeletonProps {
  /** Largura em px de cada coluna do header. Define quantas colunas e a proporção. */
  colunas: number[];
  /** Quantidade de linhas a renderizar (default 6). */
  linhas?: number;
  /** Mostrar cabeçalho (título + descrição + CTA). Default true. */
  mostrarCabecalho?: boolean;
}

/**
 * Skeleton genérico para páginas de listagem (motoristas, usuários,
 * veículos, viagens). Mantém shape parecida ao layout final pra evitar
 * layout shift quando os dados chegam.
 */
export function TabelaSkeleton({
  colunas,
  linhas = 6,
  mostrarCabecalho = true,
}: TabelaSkeletonProps): React.ReactElement {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label="Carregando lista">
      {mostrarCabecalho && (
        <HStack alignItems="center" justifyContent="between" className="mb-6">
          <VStack>
            <Placeload style={{ width: 160, height: 28 }} className="rounded" />
            <Placeload style={{ width: 110, height: 16 }} className="rounded mt-1" />
          </VStack>
          <Placeload style={{ width: 200, height: 36 }} className="rounded-md" />
        </HStack>
      )}

      <div
        className="w-full overflow-hidden rounded-xl"
        style={{ border: '1px solid #e2e8f0' }}
      >
        {/* Header */}
        <HStack
          className="gap-6 px-4 py-3"
          style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
        >
          {colunas.map((w, i) => (
            <Placeload key={i} style={{ width: w, height: 12 }} className="rounded-full" />
          ))}
        </HStack>

        {/* Linhas */}
        {Array.from({ length: linhas }).map((_, i) => (
          <HStack
            key={i}
            alignItems="center"
            className="gap-6 px-4 py-4"
            style={{
              borderBottom: i < linhas - 1 ? '1px solid #f1f5f9' : 'none',
              background: i % 2 === 0 ? '#ffffff' : '#fafafa',
            }}
          >
            {colunas.map((w, j) => (
              <Placeload key={j} style={{ width: w, height: 16 }} />
            ))}
          </HStack>
        ))}
      </div>

      <span className="sr-only">Carregando...</span>
    </div>
  );
}
