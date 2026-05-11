'use server';

import { fetchServidor } from '@/lib/api-servidor';
import type { UsuarioResposta, RespostaPaginada } from '@fleetops/types';

export interface ResumoCnhVencendo {
  total: number;
  proximos: UsuarioResposta[];
}

export async function buscarCnhsVencendoEm30Dias(): Promise<ResumoCnhVencendo> {
  const resultado = await fetchServidor<RespostaPaginada<UsuarioResposta>>(
    '/usuarios?perfil=motorista&ativo=true&cnhVencendoAteDias=30&tamanhoPagina=5',
  );
  return { total: resultado.total, proximos: resultado.dados };
}
