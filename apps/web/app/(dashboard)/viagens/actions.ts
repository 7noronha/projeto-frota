'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchServidor } from '@/lib/api-servidor';
import type { ViagemDetalhada, RespostaPaginada, UsuarioResposta, VeiculoResposta } from '@fleetops/types';

export async function buscarViagens(
  pagina = 1,
  filtros: { status?: string; motorista_id?: string; veiculo_id?: string; dataInicio?: string; dataFim?: string } = {},
): Promise<RespostaPaginada<ViagemDetalhada>> {
  const params = new URLSearchParams({ pagina: String(pagina), tamanho_pagina: '20' });
  if (filtros.status) params.set('status', filtros.status);
  if (filtros.motorista_id) params.set('motorista_id', filtros.motorista_id);
  if (filtros.veiculo_id) params.set('veiculo_id', filtros.veiculo_id);
  if (filtros.dataInicio) params.set('dataInicio', filtros.dataInicio);
  if (filtros.dataFim) params.set('dataFim', filtros.dataFim);

  return fetchServidor<RespostaPaginada<ViagemDetalhada>>(`/viagens?${params}`);
}

export async function buscarViagemPorId(id: number): Promise<ViagemDetalhada> {
  return fetchServidor<ViagemDetalhada>(`/viagens/${id}`);
}

export async function buscarMotoristas(): Promise<UsuarioResposta[]> {
  const resultado = await fetchServidor<RespostaPaginada<UsuarioResposta>>(
    '/usuarios?perfil=motorista&tamanho_pagina=100',
  );
  return resultado.dados;
}

export async function buscarVeiculosAtivos(): Promise<VeiculoResposta[]> {
  const resultado = await fetchServidor<RespostaPaginada<VeiculoResposta>>(
    '/veiculos?situacao=ativo&tamanho_pagina=100',
  );
  return resultado.dados;
}

export async function acaoCriarViagem(
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const corpo = {
    destino: formData.get('destino'),
    data_viagem: formData.get('data_viagem'),
    hora_inicio_prevista: formData.get('hora_inicio_prevista'),
    hora_fim_prevista: formData.get('hora_fim_prevista'),
    motorista_id: formData.get('motorista_id'),
    veiculo_id: formData.get('veiculo_id'),
    solicitado_por: formData.get('solicitado_por'),
    autorizado_por: formData.get('autorizado_por'),
    observacoes: formData.get('observacoes') || undefined,
  };

  try {
    await fetchServidor('/viagens', { method: 'POST', body: JSON.stringify(corpo) });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao criar viagem' };
  }

  revalidatePath('/viagens');
  redirect('/viagens');
}

export async function acaoAtualizarViagem(
  id: number,
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const corpo = {
    destino: formData.get('destino'),
    data_viagem: formData.get('data_viagem'),
    hora_inicio_prevista: formData.get('hora_inicio_prevista'),
    hora_fim_prevista: formData.get('hora_fim_prevista'),
    motorista_id: formData.get('motorista_id'),
    veiculo_id: formData.get('veiculo_id'),
    solicitado_por: formData.get('solicitado_por'),
    autorizado_por: formData.get('autorizado_por'),
    observacoes: formData.get('observacoes') || undefined,
  };

  try {
    await fetchServidor(`/viagens/${id}`, { method: 'PUT', body: JSON.stringify(corpo) });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao atualizar viagem' };
  }

  revalidatePath(`/viagens/${id}`);
  revalidatePath('/viagens');
  redirect(`/viagens/${id}`);
}

export async function acaoIniciarViagem(
  id: number,
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const odometro_inicial = Number(formData.get('odometro_inicial'));

  try {
    await fetchServidor(`/viagens/${id}/iniciar`, {
      method: 'PATCH',
      body: JSON.stringify({ odometro_inicial }),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao iniciar viagem' };
  }

  revalidatePath(`/viagens/${id}`);
  revalidatePath('/viagens');
  redirect(`/viagens/${id}`);
}

export async function acaoFinalizarViagem(
  id: number,
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const odometro_final = Number(formData.get('odometro_final'));

  try {
    await fetchServidor(`/viagens/${id}/finalizar`, {
      method: 'PATCH',
      body: JSON.stringify({ odometro_final }),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao finalizar viagem' };
  }

  revalidatePath(`/viagens/${id}`);
  revalidatePath('/viagens');
  redirect(`/viagens/${id}`);
}
