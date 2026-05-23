import { OmitType, PartialType } from '@nestjs/swagger';
import { CriarMultaDto } from './criar-multa.dto';

export class AtualizarMultaDto extends PartialType(
  OmitType(CriarMultaDto, ['veiculo_id'] as const),
) {}
