import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarVeiculoPorId } from '../../../../actions';
import {
  acaoAtualizarAbastecimento,
  buscarAbastecimentoPorId,
  buscarTiposCombustivel,
} from '../../actions';
import { FormAbastecimento } from '@/components/despesas/FormAbastecimento';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string; abastecimentoId: string }>;

export default async function PaginaEditarAbastecimento(props: { params: Params }) {
  const { id: idStr, abastecimentoId: idStrSub } = await props.params;
  const veiculoId = Number(idStr);
  const abId = Number(idStrSub);

  try {
    await buscarVeiculoPorId(veiculoId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  let abastecimento;
  try {
    abastecimento = await buscarAbastecimentoPorId(abId);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const tipos = await buscarTiposCombustivel();
  const acao = acaoAtualizarAbastecimento.bind(null, veiculoId, abId);

  return (
    <FormAbastecimento
      veiculoId={veiculoId}
      tiposCombustivel={tipos}
      abastecimentoInicial={abastecimento}
      acao={acao}
      titulo="Editar abastecimento"
    />
  );
}
