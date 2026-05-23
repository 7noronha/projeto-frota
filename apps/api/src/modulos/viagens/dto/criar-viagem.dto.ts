import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Maiusculas } from '../../../common/decorators/maiusculas.decorator';

export class CriarViagemDto {
  @ApiProperty({ example: 'AV. PAULISTA, 1000 — SÃO PAULO, SP', description: 'Endereço de destino' })
  @Maiusculas()
  @IsString()
  @IsNotEmpty({ message: 'Informe o destino' })
  @MaxLength(500, { message: 'Destino deve ter no máximo 500 caracteres' })
  destino: string;

  @ApiProperty({ example: '2026-05-10', description: 'Data da viagem (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Data da viagem inválida' })
  data_viagem: string;

  @ApiProperty({ example: '08:00', description: 'Hora planejada de início (HH:MM)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Hora de início inválida (use HH:MM)' })
  hora_inicio_prevista: string;

  @ApiProperty({ example: '12:00', description: 'Hora planejada de fim (HH:MM)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Hora de fim inválida (use HH:MM)' })
  hora_fim_prevista: string;

  @ApiProperty({ example: 42, description: 'ID do motorista (FK usuarios.id)' })
  @Type(() => Number)
  @IsInt({ message: 'motorista_id inválido' })
  @Min(1)
  motorista_id: number;

  @ApiProperty({ example: 7, description: 'ID do veículo (FK veiculos.id)' })
  @Type(() => Number)
  @IsInt({ message: 'veiculo_id inválido' })
  @Min(1)
  veiculo_id: number;

  @ApiProperty({ example: 'JOÃO DA SILVA', description: 'Nome de quem solicitou a viagem' })
  @Maiusculas()
  @IsString()
  @MinLength(3, { message: 'Solicitado por deve ter no mínimo 3 caracteres' })
  @MaxLength(200)
  solicitado_por: string;

  @ApiProperty({ example: 'MARIA SANTOS', description: 'Nome de quem autorizou a viagem' })
  @Maiusculas()
  @IsString()
  @MinLength(3, { message: 'Autorizado por deve ter no mínimo 3 caracteres' })
  @MaxLength(200)
  autorizado_por: string;

  @ApiPropertyOptional({ example: 'LEVAR DOCUMENTOS PARA ASSINATURA' })
  @Maiusculas()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
