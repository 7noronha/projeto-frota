import { ApiProperty } from '@nestjs/swagger';

export class AbastecimentoRespostaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  veiculoId: string;

  @ApiProperty({ example: 'abastecimento' })
  tipo: string;

  @ApiProperty({ example: '2026-05-19' })
  data: string;

  @ApiProperty({ example: 287.5 })
  valor: number;

  @ApiProperty({ example: 42.137 })
  litros: number;

  @ApiProperty({ example: 6.829 })
  precoLitro: number;

  @ApiProperty({ example: 'gasolina' })
  tipoCombustivel: string;

  @ApiProperty({ nullable: true, example: 152340 })
  odometro: number | null;

  @ApiProperty()
  descricao: string;

  @ApiProperty()
  dataCriacao: string;
}
