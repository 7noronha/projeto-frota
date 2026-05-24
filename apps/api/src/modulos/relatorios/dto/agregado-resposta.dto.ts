import { ApiProperty } from '@nestjs/swagger';

export class AgregadoMotoristaDto {
  @ApiProperty()
  motorista_id: number;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  matricula: string;

  @ApiProperty({ description: 'Quantidade de viagens FINALIZADAS no período' })
  total_viagens: number;

  @ApiProperty({ description: 'Soma da distância percorrida em km' })
  total_km: number;
}

export class AgregadoVeiculoDto {
  @ApiProperty()
  veiculo_id: number;

  @ApiProperty()
  placa: string;

  @ApiProperty()
  marca: string;

  @ApiProperty()
  modelo: string;

  @ApiProperty({ description: 'Quantidade de viagens FINALIZADAS no período' })
  total_viagens: number;

  @ApiProperty({ description: 'Soma da distância percorrida em km' })
  total_km: number;
}
