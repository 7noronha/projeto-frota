'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchServidor } from '@/lib/api-servidor';
import type { AbastecimentoResposta, ItemLookup } from '@fleetops/types';

export async function buscarAbastecimentoPorId(id: number): Promise<AbastecimentoResposta> {
  return fetchServidor<AbastecimentoResposta>(`/abastecimentos/${id}`);
}

export async function buscarTiposCombustivel(): Promise<ItemLookup[]> {
  return fetchServidor<ItemLookup[]>('/lookups/tipos_combustivel');
}

function corpoDeForm(formData: FormData): Record<string, unknown> {
  const odometro = formData.get('odometro');
  const observacoes = formData.get('observacoes');
  return {
    tipo_combustivel_id: Number(formData.get('tipo_combustivel_id')),
    data: String(formData.get('data')),
    valor: Number(formData.get('valor')),
    litros: Number(formData.get('litros')),
    preco_litro: Number(formData.get('preco_litro')),
    descricao: String(formData.get('descricao')),
    odometro: odometro ? Number(odometro) : undefined,
    observacoes: observacoes ? String(observacoes) : undefined,
  };
}

export async function acaoCriarAbastecimento(
  veiculoId: number,
  _e: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor('/abastecimentos', {
      method: 'POST',
      body: JSON.stringify({ veiculo_id: veiculoId, ...corpoDeForm(formData) }),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao criar abastecimento' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoAtualizarAbastecimento(
  veiculoId: number,
  id: number,
  _e: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor(`/abastecimentos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(corpoDeForm(formData)),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao atualizar abastecimento' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoExcluirAbastecimento(
  veiculoId: number,
  id: number,
): Promise<{ erro?: string } | void> {
  try {
    await fetchServidor(`/abastecimentos/${id}`, { method: 'DELETE' });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao excluir abastecimento' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
}
