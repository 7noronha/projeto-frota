import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../../../actions';
import {
  acaoAtualizarDocumentacao,
  buscarDocumentacaoPorId,
  buscarTiposDocumento,
} from '../../actions';
import { FormDocumentacao } from '@/components/despesas/FormDocumentacao';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string; documentacaoId: string }>;

export default async function PaginaEditarDocumentacao(props: { params: Params }) {
  const { id: idStr, documentacaoId: idStrSub } = await props.params;
  const veiculoId = Number(idStr);
  const dId = Number(idStrSub);

  try {
    await buscarVeiculoPorId(veiculoId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  let documentacao;
  try {
    documentacao = await buscarDocumentacaoPorId(dId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const tipos = await buscarTiposDocumento();
  const acao = acaoAtualizarDocumentacao.bind(null, veiculoId, dId);

  return (
    <FormDocumentacao
      veiculoId={veiculoId}
      tiposDocumento={tipos}
      documentacaoInicial={documentacao}
      acao={acao}
      titulo="Editar documentação"
    />
  );
}
