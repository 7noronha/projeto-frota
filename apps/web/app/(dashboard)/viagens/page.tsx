import type { Metadata } from 'next';
import Link from 'next/link';
import { TabelaViagens } from '@/components/viagens/TabelaViagens';
import { FiltrosViagens } from '@/components/viagens/FiltrosViagens';
import { buscarViagens } from './actions';
import { Button, HStack, VStack, Heading, Text } from '@lojascem/components-react';
import { Paginacao } from '@/components/Paginacao';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Viagens — FleetOps' };

interface PaginaViagensProps {
  searchParams: Promise<{ pagina?: string; status?: string; dataInicio?: string; dataFim?: string }>;
}

export default async function PaginaViagens({ searchParams }: PaginaViagensProps) {
  const params = await searchParams;
  const pagina = Number(params.pagina ?? 1);

  const temFiltrosAtivos = Boolean(params.status ?? params.dataInicio ?? params.dataFim);

  const { dados, total, total_paginas } = await buscarViagens(pagina, {
    status: params.status,
    dataInicio: params.dataInicio,
    dataFim: params.dataFim,
  });

  return (
    <div>
      {/* Cabeçalho */}
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <VStack>
          <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
            Viagens
          </Heading>
          <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
            {total} {total === 1 ? 'viagem encontrada' : 'viagens encontradas'}
          </Text>
        </VStack>
        <Link href="/viagens/nova" style={{ textDecoration: 'none' }}>
          <Button color="primary" leftIcon="PiPlusBold">Nova viagem</Button>
        </Link>
      </HStack>

      {/* Filtros */}
      <FiltrosViagens
        statusInicial={params.status ?? ''}
        dataInicioInicial={params.dataInicio ?? ''}
        dataFimInicial={params.dataFim ?? ''}
      />

      {/* Tabela */}
      <TabelaViagens viagens={dados} temFiltrosAtivos={temFiltrosAtivos} />

      <Paginacao
        total_paginas={total_paginas}
        paginaAtual={pagina}
        baseHref="/viagens"
        params={{ status: params.status, dataInicio: params.dataInicio, dataFim: params.dataFim }}
      />
    </div>
  );
}
