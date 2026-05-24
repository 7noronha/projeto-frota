'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchServidor } from '@/lib/api-servidor';
import type { SeguroResposta, ItemLookup } from '@fleetops/types';

export async function buscarSeguroPorId(id: number): Promise<SeguroResposta> {
  return fetchServidor<SeguroResposta>(`/seguros/${id}`);
}

export async function buscarTiposCobertura(): Promise<ItemLookup[]> {
  return fetchServidor<ItemLookup[]>('/lookups/tipos_cobertura_seguro');
}

function corpoDeForm(formData: FormData): Record<string, unknown> {
  const apolice = formData.get('numero_apolice');
  const observacoes = formData.get('observacoes');
  return {
    tipo_cobertura_seguro_id: Number(formData.get('tipo_cobertura_seguro_id')),
    data: String(formData.get('data')),
    valor: Number(formData.get('valor')),
    descricao: String(formData.get('descricao')),
    seguradora: String(formData.get('seguradora')),
    numero_apolice: apolice ? String(apolice) : undefined,
    vigencia_inicio: String(formData.get('vigencia_inicio')),
    vigencia_fim: String(formData.get('vigencia_fim')),
    observacoes: observacoes ? String(observacoes) : undefined,
  };
}

export async function acaoCriarSeguro(
  veiculoId: number,
  _e: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor('/seguros', {
      method: 'POST',
      body: JSON.stringify({ veiculo_id: veiculoId, ...corpoDeForm(formData) }),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao criar seguro' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoAtualizarSeguro(
  veiculoId: number,
  id: number,
  _e: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor(`/seguros/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(corpoDeForm(formData)),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao atualizar seguro' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoExcluirSeguro(
  veiculoId: number,
  id: number,
): Promise<{ erro?: string } | void> {
  try {
    await fetchServidor(`/seguros/${id}`, { method: 'DELETE' });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao excluir seguro' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
}
