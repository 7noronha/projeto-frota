import { notFound, redirect } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import {
  buscarViagemPorId,
  buscarMotoristas,
  buscarVeiculosAtivos,
  acaoAtualizarViagem,
} from '../../actions';
import { FormViagem } from '@/components/viagens/FormViagem';

type Params = Promise<{ id: string }>;

export const dynamic = 'force-dynamic';

export default async function PaginaEditarViagem(props: { params: Params }) {
  const { id } = await props.params;

  let viagem;
  try {
    viagem = await buscarViagemPorId(id);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  // Só permite editar quando status = CRIADA
  if (viagem.status !== 'CRIADA') {
    redirect(`/viagens/${id}`);
  }

  const [motoristas, veiculos] = await Promise.all([
    buscarMotoristas(),
    buscarVeiculosAtivos(),
  ]);

  const acao = acaoAtualizarViagem.bind(null, id);

  return (
    <FormViagem
      acao={acao}
      motoristas={motoristas}
      veiculos={veiculos}
      viagemInicial={viagem}
      modoEdicao
    />
  );
}
