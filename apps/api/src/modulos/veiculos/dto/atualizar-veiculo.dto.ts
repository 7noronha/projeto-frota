import { OmitType, PartialType } from '@nestjs/swagger';
import { CriarVeiculoDto } from './criar-veiculo.dto';

export class AtualizarVeiculoDto extends PartialType(
  OmitType(CriarVeiculoDto, ['placa', 'renavam'] as const),
) {}
