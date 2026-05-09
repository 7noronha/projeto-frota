import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum SituacaoVeiculoEnum {
  ATIVO = 'ativo',
  EM_MANUTENCAO = 'em_manutencao',
  INATIVO = 'inativo',
  BAIXADO = 'baixado',
}

const ANO_MINIMO = 1950;
const ANO_MAXIMO = new Date().getFullYear() + 2;

const maiusculas = () => Transform(({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value,
);

export class CriarVeiculoDto {
  @ApiProperty({
    example: 'ABC1D23',
    description: 'Placa no formato antigo (ABC1234) ou Mercosul (ABC1D23)',
  })
  @maiusculas()
  @IsString()
  @Matches(/^[A-Z]{3}\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/, {
    message: 'Placa inválida. Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul)',
  })
  placa: string;

  @ApiProperty({ example: 'TOYOTA' })
  @maiusculas()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  marca: string;

  @ApiProperty({ example: 'COROLLA' })
  @maiusculas()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  modelo: string;

  @ApiProperty({ example: 2023 })
  @Type(() => Number)
  @IsInt()
  @Min(ANO_MINIMO, { message: `Ano de fabricação mínimo: ${ANO_MINIMO}` })
  @Max(ANO_MAXIMO)
  anoFabricacao: number;

  @ApiProperty({ example: 2024 })
  @Type(() => Number)
  @IsInt()
  @Min(ANO_MINIMO, { message: `Ano do modelo mínimo: ${ANO_MINIMO}` })
  @Max(ANO_MAXIMO)
  anoModelo: number;

  @ApiProperty({ example: 'BRANCO' })
  @maiusculas()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  cor: string;

  @ApiProperty({ example: '12345678901', description: 'RENAVAM (11 dígitos)' })
  @IsString()
  @Length(11, 11, { message: 'RENAVAM deve ter exatamente 11 dígitos' })
  @Matches(/^\d{11}$/, { message: 'RENAVAM deve conter apenas dígitos' })
  renavam: string;

  @ApiProperty({ example: 15000, description: 'Odômetro atual em km' })
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Odômetro não pode ser negativo' })
  odometroAtual: number;

  @ApiProperty({ example: '2023-06-15', description: 'Data de aquisição (YYYY-MM-DD)' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato YYYY-MM-DD' })
  dataAquisicao: string;

  @ApiProperty({ enum: SituacaoVeiculoEnum, example: SituacaoVeiculoEnum.ATIVO })
  @IsEnum(SituacaoVeiculoEnum, { message: 'Situação inválida' })
  situacao: SituacaoVeiculoEnum;

  @ApiPropertyOptional({ example: 'REVISÃO REALIZADA EM 10/2024' })
  @maiusculas()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
