import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FiltrosListarVeiculosDto {
  @ApiPropertyOptional({ example: 'ABC', description: 'Filtrar por placa (busca parcial)' })
  @IsOptional()
  @IsString()
  placa?: string;

  @ApiPropertyOptional({ example: 'Corolla', description: 'Filtrar por modelo (busca parcial)' })
  @IsOptional()
  @IsString()
  modelo?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filtrar por situação (FK situacoes_veiculo.id)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  situacao_id?: number;

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
