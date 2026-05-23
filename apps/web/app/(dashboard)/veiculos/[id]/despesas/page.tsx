import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button, HStack, VStack, Heading, Text } from '@lojascem/components-react';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../actions';
import {
  buscarMultas,
  buscarAbastecimentos,
  buscarManutencoes,
  buscarImpostos,
  buscarSeguros,
  buscarDocumentacoes,
} from './actions';
import { ListaDespesasVeiculo } from '@/components/despesas/ListaDespesasVeiculo';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Despesas — FleetOps' };

type Params = Promise<{ id: string }>;

export default async function PaginaDespesas(props: { params: Params }) {
  const { id: idStr } = await props.params;
  const id = Number(idStr);

  let veiculo;
  try {
    veiculo = await buscarVeiculoPorId(id);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  // Busca em paralelo as 6 subtabelas
  const [multas, abastecimentos, manutencoes, impostos, seguros, documentacoes] = await Promise.all(
    [
      buscarMultas(id),
      buscarAbastecimentos(id),
      buscarManutencoes(id),
      buscarImpostos(id),
      buscarSeguros(id),
      buscarDocumentacoes(id),
    ],
  );

  const totalGeral =
    multas.total +
    abastecimentos.total +
    manutencoes.total +
    impostos.total +
    seguros.total +
    documentacoes.total;

  return (
    <VStack className="gap-6">
      <HStack alignItems="center" justifyContent="between">
        <VStack>
          <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
            Despesas do veículo
          </Heading>
          <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
            <span className="font-mono font-semibold">{veiculo.placa}</span> · {veiculo.marca}{' '}
            {veiculo.modelo} · {totalGeral} {totalGeral === 1 ? 'lançamento' : 'lançamentos'} no
            total
          </Text>
        </VStack>
        <Link href="/veiculos" style={{ textDecoration: 'none' }}>
          <Button variant="outline" color="default" leftIcon="PiArrowLeftBold">
            Voltar
          </Button>
        </Link>
      </HStack>

      <ListaDespesasVeiculo
        multas={multas.dados}
        abastecimentos={abastecimentos.dados}
        manutencoes={manutencoes.dados}
        impostos={impostos.dados}
        seguros={seguros.dados}
        documentacoes={documentacoes.dados}
      />
    </VStack>
  );
}
