import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FinalizarViagemDto {
  @ApiProperty({ example: 15320, description: 'Leitura do odômetro ao finalizar a viagem (km)' })
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Odômetro final não pode ser negativo' })
  odometro_final: number;
}
