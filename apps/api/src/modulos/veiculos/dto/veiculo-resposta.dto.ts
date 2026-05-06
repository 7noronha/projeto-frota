import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SituacaoVeiculoEnum } from './criar-veiculo.dto';

export class VeiculoRespostaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  placa: string;

  @ApiProperty()
  marca: string;

  @ApiProperty()
  modelo: string;

  @ApiProperty()
  anoFabricacao: number;

  @ApiProperty()
  anoModelo: number;

  @ApiProperty()
  cor: string;

  @ApiProperty()
  renavam: string;

  @ApiProperty()
  odometroAtual: number;

  @ApiProperty()
  dataAquisicao: string;

  @ApiProperty({ enum: SituacaoVeiculoEnum })
  situacao: SituacaoVeiculoEnum;

  @ApiPropertyOptional()
  observacoes: string | null;

  @ApiProperty()
  dataCriacao: string;
}
