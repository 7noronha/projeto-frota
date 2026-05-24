'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchServidor } from '@/lib/api-servidor';
import type { ManutencaoResposta, ItemLookup } from '@fleetops/types';

export async function buscarManutencaoPorId(id: number): Promise<ManutencaoResposta> {
  return fetchServidor<ManutencaoResposta>(`/manutencoes/${id}`);
}

export async function buscarTiposManutencao(): Promise<ItemLookup[]> {
  return fetchServidor<ItemLookup[]>('/lookups/tipos_manutencao');
}

function corpoDeForm(formData: FormData): Record<string, unknown> {
  const oficina = formData.get('oficina');
  const odometro = formData.get('odometro');
  const observacoes = formData.get('observacoes');
  return {
    tipo_manutencao_id: Number(formData.get('tipo_manutencao_id')),
    data: String(formData.get('data')),
    valor: Number(formData.get('valor')),
    descricao: String(formData.get('descricao')),
    oficina: oficina ? String(oficina) : undefined,
    odometro: odometro ? Number(odometro) : undefined,
    observacoes: observacoes ? String(observacoes) : undefined,
  };
}

export async function acaoCriarManutencao(
  veiculoId: number,
  _e: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor('/manutencoes', {
      method: 'POST',
      body: JSON.stringify({ veiculo_id: veiculoId, ...corpoDeForm(formData) }),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao criar manutenção' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoAtualizarManutencao(
  veiculoId: number,
  id: number,
  _e: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor(`/manutencoes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(corpoDeForm(formData)),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao atualizar manutenção' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoExcluirManutencao(
  veiculoId: number,
  id: number,
): Promise<{ erro?: string } | void> {
  try {
    await fetchServidor(`/manutencoes/${id}`, { method: 'DELETE' });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao excluir manutenção' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
}
