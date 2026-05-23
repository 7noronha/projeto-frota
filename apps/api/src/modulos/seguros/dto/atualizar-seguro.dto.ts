import { OmitType, PartialType } from '@nestjs/swagger';
import { CriarSeguroDto } from './criar-seguro.dto';

export class AtualizarSeguroDto extends PartialType(
  OmitType(CriarSeguroDto, ['veiculo_id'] as const),
) {}
