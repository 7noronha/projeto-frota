import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button, HStack, VStack, Heading, Text } from '@lojascem/components-react';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../actions';
import { buscarDespesas } from './actions';
import { TabelaDespesas } from '@/components/despesas/TabelaDespesas';
import { ResumoDespesas } from '@/components/despesas/ResumoDespesas';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Despesas — FleetOps' };

type Params = Promise<{ id: string }>;

export default async function PaginaDespesas(props: { params: Params }) {
  const { id } = await props.params;

  let veiculo;
  try {
    veiculo = await buscarVeiculoPorId(id);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const { dados: despesas, total } = await buscarDespesas(id, 1);

  return (
    <VStack className="gap-6">
      <HStack alignItems="center" justifyContent="between">
        <VStack>
          <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
            Despesas do veículo
          </Heading>
          <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
            <span className="font-mono font-semibold">{veiculo.placa}</span> · {veiculo.marca}{' '}
            {veiculo.modelo} · {total} {total === 1 ? 'lançamento' : 'lançamentos'}
          </Text>
        </VStack>
        <HStack alignItems="center" gap={2}>
          <Link href="/veiculos" style={{ textDecoration: 'none' }}>
            <Button variant="outline" color="default" leftIcon="PiArrowLeftBold">
              Voltar
            </Button>
          </Link>
          <Link href={`/veiculos/${id}/despesas/nova`} style={{ textDecoration: 'none' }}>
            <Button color="primary" leftIcon="PiPlusBold">
              Nova despesa
            </Button>
          </Link>
        </HStack>
      </HStack>

      {despesas.length > 0 && <ResumoDespesas despesas={despesas} />}

      <TabelaDespesas veiculoId={id} despesas={despesas} />
    </VStack>
  );
}
