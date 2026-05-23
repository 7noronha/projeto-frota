import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { FormDespesa } from '@/components/despesas/FormDespesa';
import { acaoAtualizarDespesa, buscarDespesaPorId } from '../../actions';

type Params = Promise<{ id: string; despesaId: string }>;

export default async function PaginaEditarDespesa(props: { params: Params }) {
  const { id, despesaId } = await props.params;

  let despesa;
  try {
    despesa = await buscarDespesaPorId(despesaId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const acao = acaoAtualizarDespesa.bind(null, id, despesaId);

  return (
    <FormDespesa
      acao={acao}
      veiculoId={id}
      despesaInicial={despesa}
      titulo="Editar despesa"
    />
  );
}
