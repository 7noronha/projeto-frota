import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FiltrosListarUsuariosDto {
  @ApiPropertyOptional({ example: 5, description: 'Filtrar por perfil (FK perfis_usuario.id)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfil_id?: number;

  @ApiPropertyOptional({ example: '0009', description: 'Filtrar por matrícula (busca parcial)' })
  @IsOptional()
  @IsString()
  matricula?: string;

  @ApiPropertyOptional({ example: 'JOÃO', description: 'Filtrar por nome (busca parcial)' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ example: true, description: 'Filtrar por status ativo/inativo' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional({
    example: 30,
    description: 'Filtra motoristas com CNH que vence em até N dias (inclusive vencidas)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365)
  cnhVencendoAteDias?: number;

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
