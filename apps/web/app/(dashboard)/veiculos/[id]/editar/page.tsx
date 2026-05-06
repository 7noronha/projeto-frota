import { notFound } from 'next/navigation';
import { FormVeiculo } from '@/components/veiculos/FormVeiculo';
import { buscarVeiculoPorId, acaoAtualizarVeiculo } from '../../actions';
import { ErroApi } from '@/lib/api-servidor';

type Params = Promise<{ id: string }>;

export default async function PaginaEditarVeiculo({ params }: { params: Params }) {
  const { id } = await params;

  let veiculo;
  try {
    veiculo = await buscarVeiculoPorId(id);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  // Vincula o id ao server action via closure
  const acaoAtualizar = acaoAtualizarVeiculo.bind(null, id);

  return (
    <FormVeiculo
      acao={acaoAtualizar}
      veiculoInicial={veiculo}
      titulo={`Editar veículo — ${veiculo.placa}`}
    />
  );
}
