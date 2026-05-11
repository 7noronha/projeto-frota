import { ApiProperty } from '@nestjs/swagger';

export class AgregadoMotoristaDto {
  @ApiProperty()
  motoristaId: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  matricula: string;

  @ApiProperty({ description: 'Quantidade de viagens FINALIZADAS no período' })
  totalViagens: number;

  @ApiProperty({ description: 'Soma da distancia percorrida em km' })
  totalKm: number;
}

export class AgregadoVeiculoDto {
  @ApiProperty()
  veiculoId: string;

  @ApiProperty()
  placa: string;

  @ApiProperty()
  marca: string;

  @ApiProperty()
  modelo: string;

  @ApiProperty({ description: 'Quantidade de viagens FINALIZADAS no período' })
  totalViagens: number;

  @ApiProperty({ description: 'Soma da distancia percorrida em km' })
  totalKm: number;
}
