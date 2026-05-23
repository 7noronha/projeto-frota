import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CriarPosicaoDto {
  @ApiProperty({ example: -23.561414, description: 'Latitude WGS84' })
  @IsNumber({}, { message: 'Latitude inválida' })
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -46.655881, description: 'Longitude WGS84' })
  @IsNumber({}, { message: 'Longitude inválida' })
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ example: 8.5, description: 'Precisão do GPS em metros' })
  @IsOptional()
  @IsNumber({}, { message: 'Precisão inválida' })
  @Min(0)
  precisaoM?: number;

  @ApiProperty({
    example: '2026-05-21T18:30:45.000Z',
    description: 'Quando o GPS capturou a posição (ISO 8601). Se ausente, usa data/hora do servidor.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'capturadoEm inválido' })
  capturadoEm?: string;
}

export class PosicaoRespostaDto {
  @ApiProperty() id: number;
  @ApiProperty() viagem_id: number;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiPropertyOptional() precisao_m: number | null;
  @ApiProperty() capturado_em: string;
}
