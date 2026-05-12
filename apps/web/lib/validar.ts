import type { z } from 'zod';

/**
 * Resultado padronizado de validação Zod no client.
 * `sucesso: true` -> dados tipados disponíveis em `dados`.
 * `sucesso: false` -> erros como `Record<campo, primeira mensagem>` pra UI inline.
 */
export type ResultadoValidacao<T> =
  | { sucesso: true; dados: T }
  | { sucesso: false; erros: Record<string, string> };

export function validar<T>(
  schema: z.ZodType<T>,
  entrada: unknown,
): ResultadoValidacao<T> {
  const resultado = schema.safeParse(entrada);
  if (resultado.success) {
    return { sucesso: true, dados: resultado.data };
  }
  const erros: Record<string, string> = {};
  for (const issue of resultado.error.issues) {
    const caminho = issue.path.join('.') || '_form';
    if (!erros[caminho]) erros[caminho] = issue.message;
  }
  return { sucesso: false, erros };
}
