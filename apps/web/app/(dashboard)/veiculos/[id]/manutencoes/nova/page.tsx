import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../../actions';
import { acaoCriarManutencao, buscarTiposManutencao } from '../actions';
import { FormManutencao } from '@/components/despesas/FormManutencao';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export default async function PaginaNovaManutencao(props: { params: Params }) {
  const { id: idStr } = await props.params;
  const veiculoId = Number(idStr);

  try {
    await buscarVeiculoPorId(veiculoId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const tipos = await buscarTiposManutencao();
  const acao = acaoCriarManutencao.bind(null, veiculoId);

  return (
    <FormManutencao
      veiculoId={veiculoId}
      tiposManutencao={tipos}
      acao={acao}
      titulo="Nova manutenção"
    />
  );
}
