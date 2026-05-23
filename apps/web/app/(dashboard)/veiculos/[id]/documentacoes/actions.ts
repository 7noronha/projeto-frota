'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchServidor } from '@/lib/api-servidor';
import type { DocumentacaoResposta, ItemLookup } from '@fleetops/types';

export async function buscarDocumentacaoPorId(id: number): Promise<DocumentacaoResposta> {
  return fetchServidor<DocumentacaoResposta>(`/documentacoes/${id}`);
}

export async function buscarTiposDocumento(): Promise<ItemLookup[]> {
  return fetchServidor<ItemLookup[]>('/lookups/tipos_documento_veiculo');
}

function corpoDeForm(formData: FormData): Record<string, unknown> {
  const vencimento = formData.get('data_vencimento');
  const observacoes = formData.get('observacoes');
  return {
    tipo_documento_veiculo_id: Number(formData.get('tipo_documento_veiculo_id')),
    data: String(formData.get('data')),
    valor: Number(formData.get('valor')),
    descricao: String(formData.get('descricao')),
    data_vencimento: vencimento ? String(vencimento) : undefined,
    observacoes: observacoes ? String(observacoes) : undefined,
  };
}

export async function acaoCriarDocumentacao(
  veiculoId: number,
  _e: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor('/documentacoes', {
      method: 'POST',
      body: JSON.stringify({ veiculo_id: veiculoId, ...corpoDeForm(formData) }),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao criar documentação' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoAtualizarDocumentacao(
  veiculoId: number,
  id: number,
  _e: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor(`/documentacoes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(corpoDeForm(formData)),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao atualizar documentação' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoExcluirDocumentacao(
  veiculoId: number,
  id: number,
): Promise<{ erro?: string } | void> {
  try {
    await fetchServidor(`/documentacoes/${id}`, { method: 'DELETE' });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao excluir documentação' };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
}
