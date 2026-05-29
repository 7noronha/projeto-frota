/**
 * Helper de paginação que aceita ambos formatos de entrada
 * (snake_case usado pelo web/mobile via querystring + camelCase
 * dos DTOs antigos) e devolve uma forma única.
 */
interface FiltrosPaginacao {
  pagina?: number;
  tamanhoPagina?: number;
  tamanho_pagina?: number;
}

interface ResultadoPaginacao {
  pagina: number;
  tamanhoPagina: number;
  skip: number;
}

export function calcularPaginacao(filtros: FiltrosPaginacao): ResultadoPaginacao {
  const pagina = filtros.pagina ?? 1;
  const tamanhoPagina = filtros.tamanho_pagina ?? filtros.tamanhoPagina ?? 20;
  const skip = (pagina - 1) * tamanhoPagina;
  return { pagina, tamanhoPagina, skip };
}
