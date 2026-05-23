import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class IniciarViagemDto {
  @ApiProperty({ example: 15000, description: 'Leitura atual do odômetro do veículo (km)' })
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Odômetro inicial não pode ser negativo' })
  odometro_inicial: number;
}
