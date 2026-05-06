import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
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
