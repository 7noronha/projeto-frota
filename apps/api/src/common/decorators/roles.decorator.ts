import { SetMetadata } from '@nestjs/common';
import { Perfil } from '@fleetops/types';

export const PERFIS_KEY = 'perfis';

export const Roles = (...perfis: Perfil[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(PERFIS_KEY, perfis);
