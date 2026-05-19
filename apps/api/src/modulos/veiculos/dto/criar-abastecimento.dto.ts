import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { TipoCombustivelEnum } from '../../despesas/dto/criar-despesa.dto';

/**
 * Abastecimento lançado pelo MOTORISTA a partir da sua viagem.
 * O veículo é derivado da viagem (não vem do cliente) e o tipo é
 * sempre "abastecimento" — definidos no service por segurança.
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
  precoLitro: number;

  @ApiProperty({ enum: TipoCombustivelEnum, example: TipoCombustivelEnum.GASOLINA })
  @IsEnum(TipoCombustivelEnum, { message: 'Tipo de combustível inválido' })
  tipoCombustivel: TipoCombustivelEnum;

  @ApiPropertyOptional({ example: 152340, description: 'Odômetro do veículo no abastecimento (km)' })
  @IsOptional()
  @IsInt({ message: 'Odômetro inválido' })
  @Min(0, { message: 'Odômetro não pode ser negativo' })
  odometro?: number;

  @ApiPropertyOptional({ example: '2026-05-19', description: 'Data do abastecimento (padrão: hoje)' })
  @IsOptional()
  @IsDateString({}, { message: 'Data inválida' })
  data?: string;

  @ApiPropertyOptional({ example: 'Posto BR — BR-153 km 12', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Descrição muito longa' })
  descricao?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Observações muito longas' })
  observacoes?: string;
}
