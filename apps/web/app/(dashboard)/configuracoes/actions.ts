'use server';

import { revalidatePath } from 'next/cache';
import { fetchServidor, ErroApi } from '@/lib/api-servidor';

export interface Configuracao {
  chave: string;
  valor: string;
  dataAtualizacao: string;
}

export async function buscarConfiguracoes(): Promise<Configuracao[]> {
  return fetchServidor<Configuracao[]>('/configuracoes');
}

export async function acaoAtualizarConfiguracao(
  chave: string,
  _estadoAnterior: { erro?: string; sucesso?: boolean } | null,
  formData: FormData,
): Promise<{ erro?: string; sucesso?: boolean } | null> {
  const valor = formData.get('valor');
  try {
    await fetchServidor<Configuracao>(`/configuracoes/${chave}`, {
      method: 'PUT',
      body: JSON.stringify({ valor }),
    });
    revalidatePath('/configuracoes');
    return { sucesso: true };
  } catch (erro) {
    if (erro instanceof ErroApi) return { erro: erro.message };
    return { erro: 'Erro ao atualizar configuração' };
  }
}
