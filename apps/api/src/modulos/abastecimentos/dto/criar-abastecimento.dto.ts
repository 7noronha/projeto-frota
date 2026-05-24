import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Maiusculas } from '../../../common/decorators/maiusculas.decorator';

export class CriarAbastecimentoDto {
  @ApiProperty({ example: 7, description: 'FK veiculos.id' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  veiculo_id: number;

  @ApiProperty({ example: 1, description: 'FK tipos_combustivel.id' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tipo_combustivel_id: number;

  @ApiProperty({ example: '2026-05-12' })
  @IsDateString()
  data: string;

  @ApiProperty({ example: 287.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor: number;

  @ApiProperty({ example: 'ABASTECIMENTO POSTO IPIRANGA' })
  @Maiusculas()
  @IsString()
  @MaxLength(500)
  descricao: string;

  @ApiProperty({ example: 42.137 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  litros: number;

  @ApiProperty({ example: 6.829 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  preco_litro: number;

  @ApiPropertyOptional({ example: 15800 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  odometro?: number;

  @ApiPropertyOptional()
  @Maiusculas()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
