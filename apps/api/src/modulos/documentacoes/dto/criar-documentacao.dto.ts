import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Maiusculas } from '../../../common/decorators/maiusculas.decorator';

export class CriarDocumentacaoDto {
  @ApiProperty({ example: 7, description: 'FK veiculos.id' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  veiculo_id: number;

  @ApiProperty({ example: 1, description: 'FK tipos_documento_veiculo.id (CRLV/transferencia/...)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tipo_documento_veiculo_id: number;

  @ApiProperty({ example: '2026-04-10' })
  @IsDateString()
  data: string;

  @ApiProperty({ example: 150 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor: number;

  @ApiProperty({ example: 'CRLV 2026' })
  @Maiusculas()
  @IsString()
  @MaxLength(500)
  descricao: string;

  @ApiPropertyOptional({ example: '2027-04-10' })
  @IsOptional()
  @IsDateString()
  data_vencimento?: string;

  @ApiPropertyOptional()
  @Maiusculas()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
