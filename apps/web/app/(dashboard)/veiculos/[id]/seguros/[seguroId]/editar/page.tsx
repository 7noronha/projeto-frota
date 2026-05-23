import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../../../actions';
import { acaoAtualizarSeguro, buscarSeguroPorId, buscarTiposCobertura } from '../../actions';
import { FormSeguro } from '@/components/despesas/FormSeguro';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string; seguroId: string }>;

export default async function PaginaEditarSeguro(props: { params: Params }) {
  const { id: idStr, seguroId: idStrSub } = await props.params;
  const veiculoId = Number(idStr);
  const sId = Number(idStrSub);

  try {
    await buscarVeiculoPorId(veiculoId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  let seguro;
  try {
    seguro = await buscarSeguroPorId(sId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const tipos = await buscarTiposCobertura();
  const acao = acaoAtualizarSeguro.bind(null, veiculoId, sId);

  return (
    <FormSeguro
      veiculoId={veiculoId}
      tiposCobertura={tipos}
      seguroInicial={seguro}
      acao={acao}
      titulo="Editar seguro"
    />
  );
}
