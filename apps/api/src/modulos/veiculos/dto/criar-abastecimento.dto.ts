import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Abastecimento lançado pelo MOTORISTA. O veículo vem do path-param,
 * e o registro vai pra tabela `abastecimentos`. tipo_combustivel é o
 * nome (ex: "gasolina"), o service resolve a FK.
 */
export class CriarAbastecimentoDto {
  @ApiProperty({ example: 287.5, description: 'Valor total pago (R$)' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor inválido' })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  valor: number;

  @ApiProperty({ example: 42.137, description: 'Litros abastecidos' })
  @IsNumber({ maxDecimalPlaces: 3 }, { message: 'Litros inválido' })
  @Min(0.001, { message: 'Litros deve ser maior que zero' })
  litros: number;

  @ApiProperty({ example: 6.829, description: 'Preço por litro (R$)' })
  @IsNumber({ maxDecimalPlaces: 3 }, { message: 'Preço por litro inválido' })
  @Min(0.001, { message: 'Preço por litro deve ser maior que zero' })
  preco_litro: number;

  @ApiProperty({ example: 'gasolina', description: 'Nome do tipo de combustível (FK pelo nome)' })
  @IsString()
  tipo_combustivel: string;

  @ApiPropertyOptional({ example: 152340 })
  @IsOptional()
  @IsInt({ message: 'Odômetro inválido' })
  @Min(0, { message: 'Odômetro não pode ser negativo' })
  odometro?: number;

  @ApiPropertyOptional({ example: '2026-05-19' })
  @IsOptional()
  @IsDateString({}, { message: 'Data inválida' })
  data?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacoes?: string;
}
