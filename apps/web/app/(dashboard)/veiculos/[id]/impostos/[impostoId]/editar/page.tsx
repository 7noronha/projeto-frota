import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../../../actions';
import {
  acaoAtualizarImposto,
  buscarImpostoPorId,
  buscarTiposImposto,
} from '../../actions';
import { FormImposto } from '@/components/despesas/FormImposto';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string; impostoId: string }>;

export default async function PaginaEditarImposto(props: { params: Params }) {
  const { id: idStr, impostoId: idStrSub } = await props.params;
  const veiculoId = Number(idStr);
  const iId = Number(idStrSub);

  try {
    await buscarVeiculoPorId(veiculoId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  let imposto;
  try {
    imposto = await buscarImpostoPorId(iId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const tipos = await buscarTiposImposto();
  const acao = acaoAtualizarImposto.bind(null, veiculoId, iId);

  return (
    <FormImposto
      veiculoId={veiculoId}
      tiposImposto={tipos}
      impostoInicial={imposto}
      acao={acao}
      titulo="Editar imposto"
    />
  );
}
