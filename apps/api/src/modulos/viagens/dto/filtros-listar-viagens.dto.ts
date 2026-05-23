import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class FiltrosListarViagensDto {
  @ApiPropertyOptional({ example: 1, description: 'ID do status (FK status_viagem.id)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  status_id?: number;

  @ApiPropertyOptional({ description: 'ID do motorista' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  motorista_id?: number;

  @ApiPropertyOptional({ description: 'ID do veículo' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  veiculo_id?: number;

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
