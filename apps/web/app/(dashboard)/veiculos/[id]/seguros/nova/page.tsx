import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../../actions';
import { acaoCriarSeguro, buscarTiposCobertura } from '../actions';
import { FormSeguro } from '@/components/despesas/FormSeguro';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export default async function PaginaNovoSeguro(props: { params: Params }) {
  const { id: idStr } = await props.params;
  const veiculoId = Number(idStr);

  try {
    await buscarVeiculoPorId(veiculoId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const tipos = await buscarTiposCobertura();
  const acao = acaoCriarSeguro.bind(null, veiculoId);

  return <FormSeguro veiculoId={veiculoId} tiposCobertura={tipos} acao={acao} titulo="Novo seguro" />;
}
