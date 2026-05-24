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

export class CriarManutencaoDto {
  @ApiProperty({ example: 7, description: 'FK veiculos.id' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  veiculo_id: number;

  @ApiProperty({ example: 1, description: 'FK tipos_manutencao.id (preventiva/corretiva)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tipo_manutencao_id: number;

  @ApiProperty({ example: '2026-05-12' })
  @IsDateString({}, { message: 'Data inválida' })
  data: string;

  @ApiProperty({ example: 850.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor: number;

  @ApiProperty({ example: 'TROCA DE ÓLEO E FILTROS' })
  @Maiusculas()
  @IsString()
  @MaxLength(500)
  descricao: string;

  @ApiPropertyOptional({ example: 'OFICINA CENTRAL — BRASÍLIA' })
  @Maiusculas()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  oficina?: string;

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
