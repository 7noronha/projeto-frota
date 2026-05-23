import { OmitType, PartialType } from '@nestjs/swagger';
import { CriarAbastecimentoDto } from './criar-abastecimento.dto';

export class AtualizarAbastecimentoDto extends PartialType(
  OmitType(CriarAbastecimentoDto, ['veiculo_id'] as const),
) {}
