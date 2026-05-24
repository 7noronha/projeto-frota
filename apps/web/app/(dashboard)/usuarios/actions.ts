'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchServidor, ErroApi } from '@/lib/api-servidor';
import type { UsuarioResposta, RespostaPaginada } from '@fleetops/types';

interface FiltrosUsuarios {
  nome?: string;
  perfil?: string;
  ativo?: string;
}

export async function buscarUsuarios(
  pagina = 1,
  filtros: FiltrosUsuarios = {},
): Promise<RespostaPaginada<UsuarioResposta>> {
  const params = new URLSearchParams({ pagina: String(pagina), tamanho_pagina: '20' });
  if (filtros.nome) params.set('nome', filtros.nome);
  if (filtros.perfil) params.set('perfil', filtros.perfil);
  if (filtros.ativo) params.set('ativo', filtros.ativo);

  return fetchServidor<RespostaPaginada<UsuarioResposta>>(`/usuarios?${params}`);
}

export async function buscarUsuarioPorId(id: number): Promise<UsuarioResposta> {
  return fetchServidor<UsuarioResposta>(`/usuarios/${id}`);
}

function montarCorpo(formData: FormData): Record<string, unknown> {
  const corpo: Record<string, unknown> = {
    matricula: formData.get('matricula'),
    nome: formData.get('nome'),
    perfil: formData.get('perfil'),
  };
  const senha = formData.get('senha');
  if (senha && String(senha).trim()) corpo.senha = senha;
  const telefone = formData.get('telefone');
  if (telefone && String(telefone).trim()) corpo.telefone = telefone;
  const email = formData.get('email');
  if (email && String(email).trim()) corpo.email = email;
  const cnh = formData.get('cnh');
  if (cnh && String(cnh).trim()) corpo.cnh = cnh;
  const cnh_validade = formData.get('cnh_validade');
  if (cnh_validade && String(cnh_validade).trim()) corpo.cnh_validade = cnh_validade;
  const ativo = formData.get('ativo');
  if (ativo !== null) corpo.ativo = ativo === 'true';
  return corpo;
}

export async function acaoCriarUsuario(
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const corpo = montarCorpo(formData);
  delete corpo.ativo; // criação sempre como ativo

  try {
    await fetchServidor('/usuarios', { method: 'POST', body: JSON.stringify(corpo) });
  } catch (erro) {
    if (erro instanceof ErroApi) return { erro: erro.message };
    return { erro: 'Erro ao criar usuário' };
  }

  revalidatePath('/usuarios');
  redirect('/usuarios');
}

export async function acaoAtualizarUsuario(
  id: number,
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const corpo = montarCorpo(formData);
  // Matrícula não pode ser alterada
  delete corpo.matricula;

  try {
    await fetchServidor(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(corpo) });
  } catch (erro) {
    if (erro instanceof ErroApi) return { erro: erro.message };
    return { erro: 'Erro ao atualizar usuário' };
  }

  revalidatePath('/usuarios');
  redirect('/usuarios');
}

export async function acaoInativarUsuario(id: number): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor(`/usuarios/${id}/inativar`, { method: 'PATCH' });
  } catch (erro) {
    if (erro instanceof ErroApi) return { erro: erro.message };
    return { erro: 'Erro ao inativar usuário' };
  }
  revalidatePath('/usuarios');
  return null;
}

export async function acaoReativarUsuario(id: number): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor(`/usuarios/${id}/reativar`, { method: 'PATCH' });
  } catch (erro) {
    if (erro instanceof ErroApi) return { erro: erro.message };
    return { erro: 'Erro ao reativar usuário' };
  }
  revalidatePath('/usuarios');
  return null;
}

export async function acaoExcluirUsuario(id: number): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor(`/usuarios/${id}`, { method: 'DELETE' });
  } catch (erro) {
    if (erro instanceof ErroApi) return { erro: erro.message };
    return { erro: 'Erro ao excluir usuário' };
  }
  revalidatePath('/usuarios');
  return null;
}
