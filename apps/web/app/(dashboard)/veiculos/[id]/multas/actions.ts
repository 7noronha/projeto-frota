'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchServidor } from '@/lib/api-servidor';
import type { MultaResposta, ItemLookup } from '@fleetops/types';

export async function buscarMultaPorId(id: number): Promise<MultaResposta> {
  return fetchServidor<MultaResposta>(`/multas/${id}`);
}

export async function buscarGravidadesMulta(): Promise<ItemLookup[]> {
  return fetchServidor<ItemLookup[]>('/lookups/gravidades_multa');
}

function corpoDeForm(formData: FormData): Record<string, unknown> {
  const numeroAuto = formData.get('numero_auto');
  const pontos = formData.get('pontos_cnh');
  const vencimento = formData.get('data_vencimento');
  const observacoes = formData.get('observacoes');
  return {
    gravidade_multa_id: Number(formData.get('gravidade_multa_id')),
    data: String(formData.get('data')),
    valor: Number(formData.get('valor')),
    descricao: String(formData.get('descricao')),
    numero_auto: numeroAuto ? String(numeroAuto) : undefined,
    pontos_cnh: pontos ? Number(pontos) : undefined,
    data_vencimento: vencimento ? String(vencimento) : undefined,
    observacoes: observacoes ? String(observacoes) : undefined,
  };
}

export async function acaoCriarMulta(
  veiculoId: number,
  _estado: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor('/multas', {
      method: 'POST',
      body: JSON.stringify({ veiculo_id: veiculoId, ...corpoDeForm(formData) }),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao criar multa' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoAtualizarMulta(
  veiculoId: number,
  id: number,
  _estado: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor(`/multas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(corpoDeForm(formData)),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao atualizar multa' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoExcluirMulta(
  veiculoId: number,
  id: number,
): Promise<{ erro?: string } | void> {
  try {
    await fetchServidor(`/multas/${id}`, { method: 'DELETE' });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao excluir multa' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
}
