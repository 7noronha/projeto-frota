import Link from 'next/link';
import { TabelaVeiculos } from '@/components/veiculos/TabelaVeiculos';
import { buscarVeiculos } from './actions';
import { Button, HStack, VStack, Heading, Text } from '@minha-empresa/components-react';

export const dynamic = 'force-dynamic';

interface PaginaVeiculosProps {
  searchParams: Promise<{ pagina?: string; placa?: string; modelo?: string; situacao?: string }>;
}

export default async function PaginaVeiculos({ searchParams }: PaginaVeiculosProps) {
  const params = await searchParams;
  const pagina = Number(params.pagina ?? 1);

  const { dados, total, totalPaginas } = await buscarVeiculos(pagina, {
    placa: params.placa,
    modelo: params.modelo,
    situacao: params.situacao,
  });

  return (
    <div>
      {/* Cabeçalho */}
      <HStack align="center" justify="between" className="mb-6">
        <VStack gap="0">
          <Heading as="h1" size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
            Veículos
          </Heading>
          <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
            {total} {total === 1 ? 'veículo cadastrado' : 'veículos cadastrados'}
          </Text>
        </VStack>
        <Link href="/veiculos/novo" style={{ textDecoration: 'none' }}>
          <Button color="primary" leftIcon="PiPlusBold">Novo veículo</Button>
        </Link>
      </HStack>

      {/* Tabela */}
      <TabelaVeiculos veiculos={dados} />

      {/* Paginação */}
      {totalPaginas > 1 && (
        <nav aria-label="Paginação" className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => {
            const sp = new URLSearchParams();
            if (params.placa) sp.set('placa', params.placa);
            if (params.modelo) sp.set('modelo', params.modelo);
            if (params.situacao) sp.set('situacao', params.situacao);
            sp.set('pagina', String(p));
            return (
              <Link
                key={p}
                href={`/veiculos?${sp.toString()}`}
                aria-label={`Página ${p}${p === pagina ? ' (atual)' : ''}`}
                aria-current={p === pagina ? 'page' : undefined}
                className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium"
                style={{
                  background: p === pagina ? '#0066FF' : 'white',
                  color: p === pagina ? 'white' : '#374151',
                  border: p === pagina ? 'none' : '1px solid #e2e8f0',
                  textDecoration: 'none',
                }}
              >
                {p}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
