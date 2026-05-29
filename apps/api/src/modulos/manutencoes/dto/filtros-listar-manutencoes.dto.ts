import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class FiltrosListarManutencoesDto {
  @ApiPropertyOptional({ description: 'Filtrar por veículo' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  veiculo_id?: number;

  @ApiPropertyOptional({ description: 'Filtrar por tipo de manutenção' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tipo_manutencao_id?: number;

  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional({ example: '2026-05-31' })
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  tamanho_pagina?: number = 20;
}
