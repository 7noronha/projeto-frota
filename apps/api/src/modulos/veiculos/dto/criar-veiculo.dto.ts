import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
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
import { Type } from 'class-transformer';
import { Maiusculas } from '../../../common/decorators/maiusculas.decorator';

const ANO_MINIMO = 1950;
const ANO_MAXIMO = new Date().getFullYear() + 2;

export class CriarVeiculoDto {
  @ApiProperty({
    example: 'ABC1D23',
    description: 'Placa no formato antigo (ABC1234) ou Mercosul (ABC1D23)',
  })
  @Maiusculas()
  @IsString()
  @Matches(/^[A-Z]{3}\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/, {
    message: 'Placa inválida. Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul)',
  })
  placa: string;

  @ApiProperty({ example: 'TOYOTA' })
  @Maiusculas()
  @IsString()
  @MinLength(1, { message: 'Marca é obrigatória' })
  @MaxLength(80, { message: 'Marca deve ter no máximo 80 caracteres' })
  marca: string;

  @ApiProperty({ example: 'COROLLA' })
  @Maiusculas()
  @IsString()
  @MinLength(1, { message: 'Modelo é obrigatório' })
  @MaxLength(100, { message: 'Modelo deve ter no máximo 100 caracteres' })
  modelo: string;

  @ApiProperty({ example: 2023 })
  @Type(() => Number)
  @IsInt()
  @Min(ANO_MINIMO, { message: `Ano de fabricação mínimo: ${ANO_MINIMO}` })
  @Max(ANO_MAXIMO, { message: `Ano de fabricação máximo: ${ANO_MAXIMO}` })
  ano_fabricacao: number;

  @ApiProperty({ example: 2024 })
  @Type(() => Number)
  @IsInt()
  @Min(ANO_MINIMO, { message: `Ano do modelo mínimo: ${ANO_MINIMO}` })
  @Max(ANO_MAXIMO, { message: `Ano do modelo máximo: ${ANO_MAXIMO}` })
  ano_modelo: number;

  @ApiProperty({ example: 'BRANCO' })
  @Maiusculas()
  @IsString()
  @MinLength(1, { message: 'Cor é obrigatória' })
  @MaxLength(50, { message: 'Cor deve ter no máximo 50 caracteres' })
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
  odometro_atual: number;

  @ApiProperty({ example: '2023-06-15', description: 'Data de aquisição (YYYY-MM-DD)' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato YYYY-MM-DD' })
  data_aquisicao: string;

  @ApiProperty({ example: 1, description: 'ID da situação (FK situacoes_veiculo.id)' })
  @Type(() => Number)
  @IsInt({ message: 'situacao_id inválido' })
  @Min(1)
  situacao_id: number;

  @ApiPropertyOptional({ example: 'REVISÃO REALIZADA EM 10/2024' })
  @Maiusculas()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
