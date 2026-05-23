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

export class CriarMultaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  veiculo_id: number;

  @ApiProperty({ example: 2, description: 'FK para gravidades_multa' })
  @IsInt()
  @IsPositive()
  gravidade_multa_id: number;

  @ApiProperty({ example: '2026-05-10', description: 'Data da infração (ISO)' })
  @IsDateString({}, { message: 'data inválida' })
  data: string;

  @ApiProperty({ example: 293.47 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valor: number;

  @ApiProperty({ example: 'Excesso de velocidade na Rod. SP-75' })
  @IsString()
  @MaxLength(500)
  descricao: string;

  @ApiPropertyOptional({ example: 'AB123456' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numero_auto?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  pontos_cnh?: number;

  @ApiPropertyOptional({ example: '2026-06-10' })
  @IsOptional()
  @IsDateString({}, { message: 'data_vencimento inválida' })
  data_vencimento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacoes?: string;
}
