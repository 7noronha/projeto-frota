'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchServidor } from '@/lib/api-servidor';
import type { VeiculoResposta, RespostaPaginada } from '@fleetops/types';

export async function buscarVeiculos(
  pagina = 1,
  filtros: { placa?: string; modelo?: string; situacao?: string } = {},
): Promise<RespostaPaginada<VeiculoResposta>> {
  const params = new URLSearchParams({ pagina: String(pagina), tamanho_pagina: '20' });
  if (filtros.placa) params.set('placa', filtros.placa);
  if (filtros.modelo) params.set('modelo', filtros.modelo);
  if (filtros.situacao) params.set('situacao', filtros.situacao);

  return fetchServidor<RespostaPaginada<VeiculoResposta>>(`/veiculos?${params}`);
}

export async function buscarVeiculoPorId(id: number): Promise<VeiculoResposta> {
  return fetchServidor<VeiculoResposta>(`/veiculos/${id}`);
}

export async function acaoCriarVeiculo(
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const corpo = {
    placa: formData.get('placa'),
    marca: formData.get('marca'),
    modelo: formData.get('modelo'),
    ano_fabricacao: Number(formData.get('ano_fabricacao')),
    ano_modelo: Number(formData.get('ano_modelo')),
    cor: formData.get('cor'),
    renavam: formData.get('renavam'),
    odometro_atual: Number(formData.get('odometro_atual')),
    data_aquisicao: formData.get('data_aquisicao'),
    situacao: formData.get('situacao'),
    observacoes: formData.get('observacoes') || undefined,
  };

  try {
    await fetchServidor('/veiculos', {
      method: 'POST',
      body: JSON.stringify(corpo),
    });
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : 'Erro ao criar veículo';
    return { erro: msg };
  }

  revalidatePath('/veiculos');
  redirect('/veiculos');
}

export async function acaoAtualizarVeiculo(
  id: number,
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const corpo = {
    marca: formData.get('marca'),
    modelo: formData.get('modelo'),
    ano_fabricacao: Number(formData.get('ano_fabricacao')),
    ano_modelo: Number(formData.get('ano_modelo')),
    cor: formData.get('cor'),
    odometro_atual: Number(formData.get('odometro_atual')),
    data_aquisicao: formData.get('data_aquisicao'),
    situacao: formData.get('situacao'),
    observacoes: formData.get('observacoes') || undefined,
  };

  try {
    await fetchServidor(`/veiculos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(corpo),
    });
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : 'Erro ao atualizar veículo';
    return { erro: msg };
  }

  revalidatePath('/veiculos');
  redirect('/veiculos');
}

export async function acaoExcluirVeiculo(id: number): Promise<{ erro?: string } | void> {
  try {
    await fetchServidor(`/veiculos/${id}`, { method: 'DELETE' });
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : 'Erro ao excluir veículo';
    return { erro: msg };
  }

  revalidatePath('/veiculos');
}
