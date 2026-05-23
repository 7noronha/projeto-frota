'use server';

import { fetchServidor } from '@/lib/api-servidor';
import type {
  RespostaPaginada,
  MultaResposta,
  AbastecimentoResposta,
  ManutencaoResposta,
  ImpostoResposta,
  SeguroResposta,
  DocumentacaoResposta,
} from '@fleetops/types';

const TAMANHO_LISTA = 50;

function paramsDeVeiculo(veiculoId: number, pagina = 1) {
  const sp = new URLSearchParams();
  sp.set('veiculo_id', String(veiculoId));
  sp.set('pagina', String(pagina));
  sp.set('tamanho_pagina', String(TAMANHO_LISTA));
  return sp.toString();
}

export async function buscarMultas(
  veiculoId: number,
): Promise<RespostaPaginada<MultaResposta>> {
  return fetchServidor<RespostaPaginada<MultaResposta>>(`/multas?${paramsDeVeiculo(veiculoId)}`);
}

export async function buscarAbastecimentos(
  veiculoId: number,
): Promise<RespostaPaginada<AbastecimentoResposta>> {
  return fetchServidor<RespostaPaginada<AbastecimentoResposta>>(
    `/abastecimentos?${paramsDeVeiculo(veiculoId)}`,
  );
}

export async function buscarManutencoes(
  veiculoId: number,
): Promise<RespostaPaginada<ManutencaoResposta>> {
  return fetchServidor<RespostaPaginada<ManutencaoResposta>>(
    `/manutencoes?${paramsDeVeiculo(veiculoId)}`,
  );
}

export async function buscarImpostos(
  veiculoId: number,
): Promise<RespostaPaginada<ImpostoResposta>> {
  return fetchServidor<RespostaPaginada<ImpostoResposta>>(
    `/impostos?${paramsDeVeiculo(veiculoId)}`,
  );
}

export async function buscarSeguros(
  veiculoId: number,
): Promise<RespostaPaginada<SeguroResposta>> {
  return fetchServidor<RespostaPaginada<SeguroResposta>>(`/seguros?${paramsDeVeiculo(veiculoId)}`);
}

export async function buscarDocumentacoes(
  veiculoId: number,
): Promise<RespostaPaginada<DocumentacaoResposta>> {
  return fetchServidor<RespostaPaginada<DocumentacaoResposta>>(
    `/documentacoes?${paramsDeVeiculo(veiculoId)}`,
  );
}
