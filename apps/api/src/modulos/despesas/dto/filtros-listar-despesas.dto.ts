import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { TipoDespesaEnum } from './criar-despesa.dto';

export class FiltrosListarDespesasDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'veiculoId inválido' })
  veiculoId?: string;

  @ApiPropertyOptional({ enum: TipoDespesaEnum })
  @IsOptional()
  @IsEnum(TipoDespesaEnum)
  tipo?: TipoDespesaEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
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
