import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarViagemPorId, acaoIniciarViagem, acaoFinalizarViagem } from '../actions';
import { DetalheViagem } from '@/components/viagens/DetalheViagem';

type Params = Promise<{ id: string }>;

export default async function PaginaDetalheViagem(props: { params: Params }) {
  const { id } = await props.params;

  let viagem;
  try {
    viagem = await buscarViagemPorId(id);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const acaoIniciar = acaoIniciarViagem.bind(null, id);
  const acaoFinalizar = acaoFinalizarViagem.bind(null, id);

  return (
    <DetalheViagem
      viagem={viagem}
      acaoIniciar={acaoIniciar}
      acaoFinalizar={acaoFinalizar}
    />
  );
}
