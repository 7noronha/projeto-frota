import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../../actions';
import { acaoCriarAbastecimento, buscarTiposCombustivel } from '../actions';
import { FormAbastecimento } from '@/components/despesas/FormAbastecimento';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export default async function PaginaNovoAbastecimento(props: { params: Params }) {
  const { id: idStr } = await props.params;
  const veiculoId = Number(idStr);

  try {
    await buscarVeiculoPorId(veiculoId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const tipos = await buscarTiposCombustivel();
  const acao = acaoCriarAbastecimento.bind(null, veiculoId);

  return (
    <FormAbastecimento
      veiculoId={veiculoId}
      tiposCombustivel={tipos}
      acao={acao}
      titulo="Novo abastecimento"
    />
  );
}
