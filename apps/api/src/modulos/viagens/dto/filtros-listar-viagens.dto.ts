import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export enum StatusViagemEnum {
  CRIADA = 'CRIADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  FINALIZADA = 'FINALIZADA',
}

export class FiltrosListarViagensDto {
  @ApiPropertyOptional({ enum: StatusViagemEnum })
  @IsOptional()
  @IsEnum(StatusViagemEnum)
  status?: StatusViagemEnum;

  @ApiPropertyOptional({ description: 'UUID do motorista' })
  @IsOptional()
  @IsUUID('4')
  motoristaId?: string;

  @ApiPropertyOptional({ description: 'UUID do veículo' })
  @IsOptional()
  @IsUUID('4')
  veiculoId?: string;

  @ApiPropertyOptional({ example: '2026-05-01', description: 'Início do período (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional({ example: '2026-05-31', description: 'Fim do período (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  tamanhoPagina?: number = 20;
}
