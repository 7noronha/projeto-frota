import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../../actions';
import { acaoCriarImposto, buscarTiposImposto } from '../actions';
import { FormImposto } from '@/components/despesas/FormImposto';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export default async function PaginaNovoImposto(props: { params: Params }) {
  const { id: idStr } = await props.params;
  const veiculoId = Number(idStr);

  try {
    await buscarVeiculoPorId(veiculoId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const tipos = await buscarTiposImposto();
  const acao = acaoCriarImposto.bind(null, veiculoId);

  return (
    <FormImposto veiculoId={veiculoId} tiposImposto={tipos} acao={acao} titulo="Novo imposto" />
  );
}
