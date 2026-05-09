interface FiltrosPaginacao {
  pagina?: number;
  tamanhoPagina?: number;
}

interface ResultadoPaginacao {
  pagina: number;
  tamanhoPagina: number;
  skip: number;
}

export function calcularPaginacao(filtros: FiltrosPaginacao): ResultadoPaginacao {
  const pagina = filtros.pagina ?? 1;
  const tamanhoPagina = filtros.tamanhoPagina ?? 20;
  const skip = (pagina - 1) * tamanhoPagina;
  return { pagina, tamanhoPagina, skip };
}
