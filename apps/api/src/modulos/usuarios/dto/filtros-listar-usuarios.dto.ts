import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PerfilEnum } from './criar-usuario.dto';

export class FiltrosListarUsuariosDto {
  @ApiPropertyOptional({ enum: PerfilEnum, description: 'Filtrar por perfil' })
  @IsOptional()
  @IsEnum(PerfilEnum)
  perfil?: PerfilEnum;

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
  @Transform(({ value }: { value: unknown }) => value === 'true' ? true : value === 'false' ? false : value)
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
