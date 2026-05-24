import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CriarSeguroDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  veiculo_id: number;

  @ApiProperty({ example: 1, description: 'FK para tipos_cobertura_seguro' })
  @IsInt()
  @IsPositive()
  tipo_cobertura_seguro_id: number;

  @ApiProperty({ example: '2026-05-10' })
  @IsDateString()
  data: string;

  @ApiProperty({ example: 1850.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valor: number;

  @ApiProperty({ example: 'Seguro anual veículo' })
  @IsString()
  @MaxLength(500)
  descricao: string;

  @ApiProperty({ example: 'Porto Seguro' })
  @IsString()
  @MaxLength(200)
  seguradora: string;

  @ApiPropertyOptional({ example: '12345-678' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  numero_apolice?: string;

  @ApiProperty({ example: '2026-05-10' })
  @IsDateString()
  vigencia_inicio: string;

  @ApiProperty({ example: '2027-05-10' })
  @IsDateString()
  vigencia_fim: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacoes?: string;
}
