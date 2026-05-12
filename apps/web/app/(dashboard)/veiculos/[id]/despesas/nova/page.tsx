import { FormDespesa } from '@/components/despesas/FormDespesa';
import { acaoCriarDespesa } from '../actions';

type Params = Promise<{ id: string }>;

export default async function PaginaNovaDespesa(props: { params: Params }) {
  const { id } = await props.params;
  const acao = acaoCriarDespesa.bind(null, id);
  return <FormDespesa acao={acao} veiculoId={id} titulo="Nova despesa" />;
}
