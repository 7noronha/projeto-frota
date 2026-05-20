import type { Metadata } from 'next';
import { VStack, Heading, Text } from '@lojascem/components-react';
import { FiltrosPeriodo } from '@/components/relatorios/FiltrosPeriodo';
import { RelatorioMotoristas } from '@/components/relatorios/RelatorioMotoristas';
import { RelatorioVeiculos } from '@/components/relatorios/RelatorioVeiculos';
import { formatarDataIso } from '@fleetops/utils';
import {
  buscarDistanciaPorMotorista,
  buscarDistanciaPorVeiculo,
} from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Relatórios — FleetOps' };

interface PaginaRelatoriosProps {
  searchParams: Promise<{ dataInicio?: string; dataFim?: string }>;
}

export default async function PaginaRelatorios({ searchParams }: PaginaRelatoriosProps) {
  const params = await searchParams;

  const [motoristas, veiculos] = await Promise.all([
    buscarDistanciaPorMotorista(params),
    buscarDistanciaPorVeiculo(params),
  ]);

  const rotuloPeriodo = (() => {
    if (params.dataInicio && params.dataFim) {
      return `${formatarDataIso(params.dataInicio)} a ${formatarDataIso(params.dataFim)}`;
    }
    if (params.dataInicio) return `a partir de ${formatarDataIso(params.dataInicio)}`;
    if (params.dataFim) return `até ${formatarDataIso(params.dataFim)}`;
    return 'todo o histórico';
  })();

  return (
    <VStack className="gap-6">
      <VStack>
        <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
          Relatórios
        </Heading>
        <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
          Quilometragem agregada por motorista e por veículo · período: <strong>{rotuloPeriodo}</strong>
        </Text>
      </VStack>

      <FiltrosPeriodo
        dataInicioInicial={params.dataInicio ?? ''}
        dataFimInicial={params.dataFim ?? ''}
      />

      <RelatorioMotoristas dados={motoristas} />
      <RelatorioVeiculos dados={veiculos} />
    </VStack>
  );
}
