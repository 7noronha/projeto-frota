import { SetMetadata } from '@nestjs/common';

export const PERFIS_KEY = 'perfis';

/**
 * Restringe o endpoint aos perfis informados. O nome do perfil bate
 * com o campo `nome` da tabela `perfis_usuario`.
 */
export const Roles = (...perfis: string[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(PERFIS_KEY, perfis);
