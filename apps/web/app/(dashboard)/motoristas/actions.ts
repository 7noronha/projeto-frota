'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchServidor } from '@/lib/api-servidor';
import type { UsuarioResposta, RespostaPaginada } from '@fleetops/types';

export async function buscarMotoristas(
  pagina = 1,
  filtros: { nome?: string; ativo?: string } = {},
): Promise<RespostaPaginada<UsuarioResposta>> {
  const params = new URLSearchParams({
    pagina: String(pagina),
    tamanho_pagina: '20',
    perfil: 'motorista',
  });
  if (filtros.nome) params.set('nome', filtros.nome);
  if (filtros.ativo) params.set('ativo', filtros.ativo);

  return fetchServidor<RespostaPaginada<UsuarioResposta>>(`/usuarios?${params}`);
}

export async function buscarMotoristaPorId(id: number): Promise<UsuarioResposta> {
  return fetchServidor<UsuarioResposta>(`/usuarios/${id}`);
}

export async function acaoCriarMotorista(
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const corpo = {
    matricula: formData.get('matricula'),
    nome: formData.get('nome'),
    senha: formData.get('senha'),
    perfil: 'motorista',
    telefone: formData.get('telefone') || undefined,
    cnh: formData.get('cnh'),
    cnh_validade: formData.get('cnh_validade'),
    ativo: true,
  };

  try {
    await fetchServidor('/usuarios', {
      method: 'POST',
      body: JSON.stringify(corpo),
    });
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : 'Erro ao cadastrar motorista';
    return { erro: msg };
  }

  revalidatePath('/motoristas');
  redirect('/motoristas');
}

export async function acaoAtualizarMotorista(
  id: number,
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const senhaRaw = formData.get('senha');

  const corpo: Record<string, unknown> = {
    nome: formData.get('nome'),
    telefone: formData.get('telefone') || undefined,
    cnh: formData.get('cnh'),
    cnh_validade: formData.get('cnh_validade'),
    ativo: formData.get('ativo') === 'true',
  };

  if (senhaRaw && String(senhaRaw).trim()) {
    corpo.senha = senhaRaw;
  }

  try {
    await fetchServidor(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(corpo),
    });
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : 'Erro ao atualizar motorista';
    return { erro: msg };
  }

  revalidatePath('/motoristas');
  redirect('/motoristas');
}

export async function acaoInativarMotorista(id: number): Promise<{ erro?: string } | void> {
  try {
    await fetchServidor(`/usuarios/${id}/inativar`, { method: 'PATCH' });
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : 'Erro ao inativar motorista';
    return { erro: msg };
  }

  revalidatePath('/motoristas');
}

export async function acaoReativarMotorista(id: number): Promise<{ erro?: string } | void> {
  try {
    await fetchServidor(`/usuarios/${id}/reativar`, { method: 'PATCH' });
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : 'Erro ao reativar motorista';
    return { erro: msg };
  }

  revalidatePath('/motoristas');
}

export async function acaoExcluirMotorista(id: number): Promise<{ erro?: string } | void> {
  try {
    await fetchServidor(`/usuarios/${id}`, { method: 'DELETE' });
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : 'Erro ao excluir motorista';
    return { erro: msg };
  }

  revalidatePath('/motoristas');
}
