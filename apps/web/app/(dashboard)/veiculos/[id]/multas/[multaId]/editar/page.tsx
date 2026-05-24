import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../../../actions';
import { acaoAtualizarMulta, buscarGravidadesMulta, buscarMultaPorId } from '../../actions';
import { FormMulta } from '@/components/despesas/FormMulta';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string; multaId: string }>;

export default async function PaginaEditarMulta(props: { params: Params }) {
  const { id: idStr, multaId: multaIdStr } = await props.params;
  const veiculoId = Number(idStr);
  const multaId = Number(multaIdStr);

  try {
    await buscarVeiculoPorId(veiculoId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  let multa;
  try {
    multa = await buscarMultaPorId(multaId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const gravidades = await buscarGravidadesMulta();
  const acao = acaoAtualizarMulta.bind(null, veiculoId, multaId);

  return (
    <FormMulta
      veiculoId={veiculoId}
      gravidades={gravidades}
      multaInicial={multa}
      acao={acao}
      titulo="Editar multa"
    />
  );
}
