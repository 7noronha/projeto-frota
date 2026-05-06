import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum PerfilEnum {
  ADMIN = 'admin',
  GERENTE = 'gerente',
  ENCARREGADO = 'encarregado',
  OPERADOR = 'operador',
  MOTORISTA = 'motorista',
}

export class CriarUsuarioDto {
  @ApiProperty({ example: '0009003656', description: 'Matrícula funcional (10 dígitos)' })
  @IsString()
  @Length(10, 10, { message: 'Matrícula deve ter exatamente 10 dígitos' })
  @Matches(/^\d{10}$/, { message: 'Matrícula deve conter apenas dígitos numéricos' })
  matricula: string;

  @ApiProperty({ example: 'João da Silva', description: 'Nome completo' })
  @IsString()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(200)
  nome: string;

  @ApiProperty({ example: 'MinhaS3nha!', description: 'Senha (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  senha: string;

  @ApiProperty({ enum: PerfilEnum, example: PerfilEnum.OPERADOR })
  @IsEnum(PerfilEnum, { message: 'Perfil inválido' })
  perfil: PerfilEnum;

  @ApiPropertyOptional({ example: 'joao@empresa.com' })
  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(200)
  email?: string;

  @ApiPropertyOptional({ example: '(61) 99999-0000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional({ example: '12345678900', description: 'Obrigatório para motoristas' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cnh?: string;

  @ApiPropertyOptional({ example: '2028-12-31', description: 'Obrigatório para motoristas (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato YYYY-MM-DD' })
  cnhValidade?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
