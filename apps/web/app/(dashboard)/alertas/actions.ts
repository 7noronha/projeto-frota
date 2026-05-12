'use server';

import { fetchServidor } from '@/lib/api-servidor';

export type SeveridadeAlerta = 'alto' | 'medio' | 'baixo';

export interface Alerta {
  id: string;
  tipo: 'cnh_vencida' | 'cnh_vencendo' | 'viagem_atrasada' | 'viagem_sem_inicio';
  severidade: SeveridadeAlerta;
  titulo: string;
  descricao: string;
  alvoId: string;
  alvoTipo: 'motorista' | 'viagem';
  href?: string;
}

export async function buscarAlertas(): Promise<Alerta[]> {
  return fetchServidor<Alerta[]>('/alertas');
}
