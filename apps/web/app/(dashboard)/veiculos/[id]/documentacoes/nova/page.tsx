import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../../actions';
import { acaoCriarDocumentacao, buscarTiposDocumento } from '../actions';
import { FormDocumentacao } from '@/components/despesas/FormDocumentacao';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export default async function PaginaNovaDocumentacao(props: { params: Params }) {
  const { id: idStr } = await props.params;
  const veiculoId = Number(idStr);

  try {
    await buscarVeiculoPorId(veiculoId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const tipos = await buscarTiposDocumento();
  const acao = acaoCriarDocumentacao.bind(null, veiculoId);

  return (
    <FormDocumentacao
      veiculoId={veiculoId}
      tiposDocumento={tipos}
      acao={acao}
      titulo="Nova documentação"
    />
  );
}
