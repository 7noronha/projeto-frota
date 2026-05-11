import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class FiltrosPeriodoDto {
  @ApiPropertyOptional({ example: '2026-04-01', description: 'Data inicial (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'Data inicial inválida' })
  dataInicio?: string;

  @ApiPropertyOptional({ example: '2026-04-30', description: 'Data final (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'Data final inválida' })
  dataFim?: string;
}
