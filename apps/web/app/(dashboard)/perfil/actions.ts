'use server';

import { revalidatePath } from 'next/cache';
import { fetchServidor, ErroApi } from '@/lib/api-servidor';
import type { UsuarioResposta } from '@fleetops/types';

export async function buscarMeuPerfil(): Promise<UsuarioResposta> {
  return fetchServidor<UsuarioResposta>('/auth/me');
}

export async function acaoAtualizarDadosPessoais(
  _estadoAnterior: { erro?: string; sucesso?: boolean } | null,
  formData: FormData,
): Promise<{ erro?: string; sucesso?: boolean } | null> {
  const corpo: Record<string, unknown> = {};
  const email = formData.get('email');
  if (email !== null) corpo.email = String(email).trim();
  const telefone = formData.get('telefone');
  if (telefone !== null) corpo.telefone = String(telefone).trim();

  try {
    await fetchServidor('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(corpo),
    });
  } catch (erro) {
    if (erro instanceof ErroApi) return { erro: erro.message };
    return { erro: 'Erro ao atualizar dados' };
  }
  revalidatePath('/perfil');
  return { sucesso: true };
}

export async function acaoTrocarSenha(
  _estadoAnterior: { erro?: string; sucesso?: boolean } | null,
  formData: FormData,
): Promise<{ erro?: string; sucesso?: boolean } | null> {
  const senhaAtual = String(formData.get('senhaAtual') ?? '');
  const novaSenha = String(formData.get('novaSenha') ?? '');
  const confirmacao = String(formData.get('confirmacao') ?? '');

  if (!senhaAtual.trim()) return { erro: 'Informe sua senha atual' };
  if (novaSenha.length < 8) return { erro: 'Nova senha deve ter no mínimo 8 caracteres' };
  if (novaSenha !== confirmacao) return { erro: 'A confirmação não confere com a nova senha' };

  try {
    await fetchServidor('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });
  } catch (erro) {
    if (erro instanceof ErroApi) return { erro: erro.message };
    return { erro: 'Erro ao trocar senha' };
  }
  revalidatePath('/perfil');
  return { sucesso: true };
}
