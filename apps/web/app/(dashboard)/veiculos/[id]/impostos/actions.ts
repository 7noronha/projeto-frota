'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchServidor } from '@/lib/api-servidor';
import type { ImpostoResposta, ItemLookup } from '@fleetops/types';

export async function buscarImpostoPorId(id: number): Promise<ImpostoResposta> {
  return fetchServidor<ImpostoResposta>(`/impostos/${id}`);
}

export async function buscarTiposImposto(): Promise<ItemLookup[]> {
  return fetchServidor<ItemLookup[]>('/lookups/tipos_imposto');
}

function corpoDeForm(formData: FormData): Record<string, unknown> {
  const numeroParcela = formData.get('numero_parcela');
  const totalParcelas = formData.get('total_parcelas');
  const vencimento = formData.get('data_vencimento');
  const observacoes = formData.get('observacoes');
  return {
    tipo_imposto_id: Number(formData.get('tipo_imposto_id')),
    data: String(formData.get('data')),
    valor: Number(formData.get('valor')),
    descricao: String(formData.get('descricao')),
    ano_exercicio: Number(formData.get('ano_exercicio')),
    numero_parcela: numeroParcela ? Number(numeroParcela) : undefined,
    total_parcelas: totalParcelas ? Number(totalParcelas) : undefined,
    data_vencimento: vencimento ? String(vencimento) : undefined,
    observacoes: observacoes ? String(observacoes) : undefined,
  };
}

export async function acaoCriarImposto(
  veiculoId: number,
  _e: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor('/impostos', {
      method: 'POST',
      body: JSON.stringify({ veiculo_id: veiculoId, ...corpoDeForm(formData) }),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao criar imposto' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoAtualizarImposto(
  veiculoId: number,
  id: number,
  _e: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor(`/impostos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(corpoDeForm(formData)),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao atualizar imposto' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoExcluirImposto(
  veiculoId: number,
  id: number,
): Promise<{ erro?: string } | void> {
  try {
    await fetchServidor(`/impostos/${id}`, { method: 'DELETE' });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao excluir imposto' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
}
