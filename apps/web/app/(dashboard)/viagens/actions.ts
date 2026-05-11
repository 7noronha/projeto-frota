'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchServidor } from '@/lib/api-servidor';
import type { ViagemDetalhada, RespostaPaginada, UsuarioResposta, VeiculoResposta } from '@fleetops/types';

export async function buscarViagens(
  pagina = 1,
  filtros: { status?: string; motoristaId?: string; veiculoId?: string; dataInicio?: string; dataFim?: string } = {},
): Promise<RespostaPaginada<ViagemDetalhada>> {
  const params = new URLSearchParams({ pagina: String(pagina), tamanhoPagina: '20' });
  if (filtros.status) params.set('status', filtros.status);
  if (filtros.motoristaId) params.set('motoristaId', filtros.motoristaId);
  if (filtros.veiculoId) params.set('veiculoId', filtros.veiculoId);
  if (filtros.dataInicio) params.set('dataInicio', filtros.dataInicio);
  if (filtros.dataFim) params.set('dataFim', filtros.dataFim);

  return fetchServidor<RespostaPaginada<ViagemDetalhada>>(`/viagens?${params}`);
}

export async function buscarViagemPorId(id: string): Promise<ViagemDetalhada> {
  return fetchServidor<ViagemDetalhada>(`/viagens/${id}`);
}

export async function buscarMotoristas(): Promise<UsuarioResposta[]> {
  const resultado = await fetchServidor<RespostaPaginada<UsuarioResposta>>(
    '/usuarios?perfil=motorista&tamanhoPagina=100',
  );
  return resultado.dados;
}

export async function buscarVeiculosAtivos(): Promise<VeiculoResposta[]> {
  const resultado = await fetchServidor<RespostaPaginada<VeiculoResposta>>(
    '/veiculos?situacao=ativo&tamanhoPagina=100',
  );
  return resultado.dados;
}

export async function acaoCriarViagem(
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const corpo = {
    destino: formData.get('destino'),
    dataViagem: formData.get('dataViagem'),
    horaInicioPrevista: formData.get('horaInicioPrevista'),
    horaFimPrevista: formData.get('horaFimPrevista'),
    motoristaId: formData.get('motoristaId'),
    veiculoId: formData.get('veiculoId'),
    solicitadoPor: formData.get('solicitadoPor'),
    autorizadoPor: formData.get('autorizadoPor'),
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
  id: string,
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const corpo = {
    destino: formData.get('destino'),
    dataViagem: formData.get('dataViagem'),
    horaInicioPrevista: formData.get('horaInicioPrevista'),
    horaFimPrevista: formData.get('horaFimPrevista'),
    motoristaId: formData.get('motoristaId'),
    veiculoId: formData.get('veiculoId'),
    solicitadoPor: formData.get('solicitadoPor'),
    autorizadoPor: formData.get('autorizadoPor'),
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
  id: string,
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const odometroInicial = Number(formData.get('odometroInicial'));

  try {
    await fetchServidor(`/viagens/${id}/iniciar`, {
      method: 'PATCH',
      body: JSON.stringify({ odometroInicial }),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao iniciar viagem' };
  }

  revalidatePath(`/viagens/${id}`);
  revalidatePath('/viagens');
  redirect(`/viagens/${id}`);
}

export async function acaoFinalizarViagem(
  id: string,
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const odometroFinal = Number(formData.get('odometroFinal'));

  try {
    await fetchServidor(`/viagens/${id}/finalizar`, {
      method: 'PATCH',
      body: JSON.stringify({ odometroFinal }),
    });
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : 'Erro ao finalizar viagem' };
  }

  revalidatePath(`/viagens/${id}`);
  revalidatePath('/viagens');
  redirect(`/viagens/${id}`);
}
