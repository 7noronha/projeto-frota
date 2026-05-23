import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CriarImpostoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  veiculo_id: number;

  @ApiProperty({ example: 1, description: 'FK para tipos_imposto' })
  @IsInt()
  @IsPositive()
  tipo_imposto_id: number;

  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  data: string;

  @ApiProperty({ example: 1240.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valor: number;

  @ApiProperty({ example: 'IPVA 2026' })
  @IsString()
  @MaxLength(500)
  descricao: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  ano_exercicio: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  numero_parcela?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  total_parcelas?: number;

  @ApiPropertyOptional({ example: '2026-02-15' })
  @IsOptional()
  @IsDateString()
  data_vencimento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacoes?: string;
}
