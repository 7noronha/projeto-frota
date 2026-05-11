/**
 * Utilitário para exportar arrays de objetos como CSV no browser.
 * Sem dependencia externa — gera blob e dispara download.
 *
 * Uso:
 *   exportarCsv('relatorio-motoristas.csv', dados, [
 *     { cabecalho: 'Nome', valor: (d) => d.nome },
 *     { cabecalho: 'Total km', valor: (d) => d.totalKm.toString() },
 *   ]);
 */
export interface ColunaCsv<T> {
  cabecalho: string;
  valor: (linha: T) => string;
}

function escapar(campo: string): string {
  // RFC 4180: campos com aspas, vírgula ou quebra de linha vão entre aspas duplas; aspas internas duplicam
  if (/[",\n\r]/.test(campo)) {
    return `"${campo.replace(/"/g, '""')}"`;
  }
  return campo;
}

export function exportarCsv<T>(
  nomeArquivo: string,
  dados: T[],
  colunas: ColunaCsv<T>[],
): void {
  const linhas: string[] = [];
  linhas.push(colunas.map((c) => escapar(c.cabecalho)).join(';'));
  for (const linha of dados) {
    linhas.push(colunas.map((c) => escapar(c.valor(linha))).join(';'));
  }
  // BOM UTF-8 garante que Excel abra com acentuação correta
  const conteudo = '﻿' + linhas.join('\r\n');
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
