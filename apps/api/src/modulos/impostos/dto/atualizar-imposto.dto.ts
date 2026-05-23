import { OmitType, PartialType } from '@nestjs/swagger';
import { CriarImpostoDto } from './criar-imposto.dto';

export class AtualizarImpostoDto extends PartialType(
  OmitType(CriarImpostoDto, ['veiculo_id'] as const),
) {}
