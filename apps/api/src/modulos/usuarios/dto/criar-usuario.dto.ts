import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';
import { Maiusculas } from '../../../common/decorators/maiusculas.decorator';

export class CriarUsuarioDto {
  @ApiProperty({ example: '0009003656', description: 'Matrícula funcional (10 dígitos)' })
  @IsString()
  @Length(10, 10, { message: 'Matrícula deve ter exatamente 10 dígitos' })
  @Matches(/^\d{10}$/, { message: 'Matrícula deve conter apenas dígitos numéricos' })
  matricula: string;

  @ApiProperty({ example: 'JOÃO DA SILVA', description: 'Nome completo' })
  @Maiusculas()
  @IsString()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(200, { message: 'Nome deve ter no máximo 200 caracteres' })
  nome: string;

  @ApiProperty({ example: 'MinhaS3nha!', description: 'Senha (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  senha: string;

  @ApiProperty({ example: 1, description: 'ID do perfil (FK perfis_usuario.id)' })
  @Type(() => Number)
  @IsInt({ message: 'perfil_id inválido' })
  @Min(1)
  perfil_id: number;

  @ApiPropertyOptional({ example: 'joao@empresa.com' })
  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(200)
  email?: string;

  @ApiPropertyOptional({ example: '(61) 99999-0000' })
  @Maiusculas()
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Telefone deve ter no máximo 20 caracteres' })
  telefone?: string;

  @ApiPropertyOptional({ example: '12345678900', description: 'Obrigatório para motoristas' })
  @Maiusculas()
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'CNH deve ter no máximo 20 caracteres' })
  cnh?: string;

  @ApiPropertyOptional({ example: '2028-12-31', description: 'Obrigatório para motoristas (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato YYYY-MM-DD' })
  cnh_validade?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
