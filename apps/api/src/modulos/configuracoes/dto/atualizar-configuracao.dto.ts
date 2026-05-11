import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { Maiusculas } from '../../../common/decorators/maiusculas.decorator';

export class AtualizarConfiguracaoDto {
  @ApiProperty({
    example: 'RUA DA SEDE, 1 — CENTRO, BRASÍLIA, DF',
    description: 'Novo valor para a configuração',
  })
  @Maiusculas()
  @IsString()
  @MinLength(1, { message: 'Valor é obrigatório' })
  @MaxLength(500, { message: 'Valor deve ter no máximo 500 caracteres' })
  valor: string;
}
