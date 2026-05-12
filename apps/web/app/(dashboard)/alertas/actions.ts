'use server';

import { fetchServidor } from '@/lib/api-servidor';

export type SeveridadeAlerta = 'alto' | 'medio' | 'baixo';

export type TipoAlerta =
  | 'cnh_vencida'
  | 'cnh_vencendo'
  | 'viagem_atrasada'
  | 'viagem_sem_inicio'
  | 'multa_vencida'
  | 'multa_vencendo'
  | 'manutencao_devida';

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  severidade: SeveridadeAlerta;
  titulo: string;
  descricao: string;
  alvoId: string;
  alvoTipo: 'motorista' | 'viagem' | 'veiculo' | 'despesa';
  href?: string;
}

export async function buscarAlertas(): Promise<Alerta[]> {
  return fetchServidor<Alerta[]>('/alertas');
}
