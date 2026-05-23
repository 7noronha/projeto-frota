import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../../actions';
import { acaoCriarMulta, buscarGravidadesMulta } from '../actions';
import { FormMulta } from '@/components/despesas/FormMulta';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export default async function PaginaNovaMulta(props: { params: Params }) {
  const { id: idStr } = await props.params;
  const veiculoId = Number(idStr);

  try {
    await buscarVeiculoPorId(veiculoId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const gravidades = await buscarGravidadesMulta();
  const acao = acaoCriarMulta.bind(null, veiculoId);

  return <FormMulta veiculoId={veiculoId} gravidades={gravidades} acao={acao} titulo="Nova multa" />;
}
