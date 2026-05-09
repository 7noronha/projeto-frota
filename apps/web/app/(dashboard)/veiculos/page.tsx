import Link from 'next/link';
import { TabelaVeiculos } from '@/components/veiculos/TabelaVeiculos';
import { buscarVeiculos } from './actions';
import { Paginacao } from '@/components/Paginacao';
import { Button, HStack, VStack, Heading, Text } from '@lojascem/components-react';

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
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <VStack>
          <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
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

      <Paginacao
        totalPaginas={totalPaginas}
        paginaAtual={pagina}
        baseHref="/veiculos"
        params={{ placa: params.placa, modelo: params.modelo, situacao: params.situacao }}
      />
    </div>
  );
}
