import { OmitType, PartialType } from '@nestjs/swagger';
import { CriarManutencaoDto } from './criar-manutencao.dto';

export class AtualizarManutencaoDto extends PartialType(
  OmitType(CriarManutencaoDto, ['veiculo_id'] as const),
) {}
