import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../../../actions';
import {
  acaoAtualizarManutencao,
  buscarManutencaoPorId,
  buscarTiposManutencao,
} from '../../actions';
import { FormManutencao } from '@/components/despesas/FormManutencao';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string; manutencaoId: string }>;

export default async function PaginaEditarManutencao(props: { params: Params }) {
  const { id: idStr, manutencaoId: idStrSub } = await props.params;
  const veiculoId = Number(idStr);
  const mId = Number(idStrSub);

  try {
    await buscarVeiculoPorId(veiculoId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  let manutencao;
  try {
    manutencao = await buscarManutencaoPorId(mId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const tipos = await buscarTiposManutencao();
  const acao = acaoAtualizarManutencao.bind(null, veiculoId, mId);

  return (
    <FormManutencao
      veiculoId={veiculoId}
      tiposManutencao={tipos}
      manutencaoInicial={manutencao}
      acao={acao}
      titulo="Editar manutenção"
    />
  );
}
