import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, HStack, VStack, Heading, Text } from '@lojascem/components-react';
import { TabelaMotoristas } from '@/components/motoristas/TabelaMotoristas';
import { FiltrosMotoristas } from '@/components/motoristas/FiltrosMotoristas';
import { buscarMotoristas } from './actions';
import { Paginacao } from '@/components/Paginacao';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Motoristas — FleetOps' };

interface PaginaMotoristasProps {
  searchParams: Promise<{ pagina?: string; nome?: string; ativo?: string }>;
}

export default async function PaginaMotoristas({ searchParams }: PaginaMotoristasProps) {
  const params = await searchParams;
  const pagina = Number(params.pagina ?? 1);

  const { dados, total, total_paginas } = await buscarMotoristas(pagina, {
    nome: params.nome,
    ativo: params.ativo,
  });

  return (
    <div>
      {/* Cabeçalho */}
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <VStack>
          <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
            Motoristas
          </Heading>
          <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
            {total} {total === 1 ? 'motorista encontrado' : 'motoristas encontrados'}
          </Text>
        </VStack>
        <Link href="/motoristas/novo" style={{ textDecoration: 'none' }}>
          <Button color="primary" leftIcon="PiPlusBold">Cadastrar motorista</Button>
        </Link>
      </HStack>

      {/* Filtros */}
      <FiltrosMotoristas nomeInicial={params.nome ?? ''} ativoInicial={params.ativo ?? ''} />

      {/* Tabela */}
      <TabelaMotoristas motoristas={dados} />

      {/* Paginação */}
      <Paginacao
        total_paginas={total_paginas}
        paginaAtual={pagina}
        baseHref="/motoristas"
        params={{ nome: params.nome, ativo: params.ativo }}
      />
    </div>
  );
}
