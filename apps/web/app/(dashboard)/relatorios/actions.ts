'use server';

import { fetchServidor } from '@/lib/api-servidor';

export interface AgregadoMotorista {
  motorista_id: string;
  nome: string;
  matricula: string;
  totalViagens: number;
  totalKm: number;
}

export interface AgregadoVeiculo {
  veiculo_id: string;
  placa: string;
  marca: string;
  modelo: string;
  totalViagens: number;
  totalKm: number;
}

function querystring(filtros: { dataInicio?: string; dataFim?: string }): string {
  const params = new URLSearchParams();
  if (filtros.dataInicio) params.set('dataInicio', filtros.dataInicio);
  if (filtros.dataFim) params.set('dataFim', filtros.dataFim);
  return params.toString() ? `?${params}` : '';
}

export async function buscarDistanciaPorMotorista(filtros: {
  dataInicio?: string;
  dataFim?: string;
}): Promise<AgregadoMotorista[]> {
  return fetchServidor<AgregadoMotorista[]>(
    `/relatorios/distancia-por-motorista${querystring(filtros)}`,
  );
}

export async function buscarDistanciaPorVeiculo(filtros: {
  dataInicio?: string;
  dataFim?: string;
}): Promise<AgregadoVeiculo[]> {
  return fetchServidor<AgregadoVeiculo[]>(
    `/relatorios/distancia-por-veiculo${querystring(filtros)}`,
  );
}
