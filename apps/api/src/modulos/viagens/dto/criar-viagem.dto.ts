import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import { Maiusculas } from '../../../common/decorators/maiusculas.decorator';

export class CriarViagemDto {
  @ApiProperty({ example: 'AV. PAULISTA, 1000 — SÃO PAULO, SP', description: 'Endereço de destino' })
  @Maiusculas()
  @IsString()
  @MinLength(5, { message: 'Destino deve ter no mínimo 5 caracteres' })
  @MaxLength(500)
  destino: string;

  @ApiProperty({ example: '2026-05-10', description: 'Data da viagem (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Data da viagem inválida' })
  dataViagem: string;

  @ApiProperty({ example: '08:00', description: 'Hora planejada de início (HH:MM)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Hora de início inválida (use HH:MM, ex.: 08:00)' })
  horaInicioPrevista: string;

  @ApiProperty({ example: '12:00', description: 'Hora planejada de fim (HH:MM)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Hora de fim inválida (use HH:MM, ex.: 12:00)' })
  horaFimPrevista: string;

  @ApiProperty({ example: 'uuid-do-motorista' })
  @IsUUID('4', { message: 'motoristaId inválido' })
  motoristaId: string;

  @ApiProperty({ example: 'uuid-do-veiculo' })
  @IsUUID('4', { message: 'veiculoId inválido' })
  veiculoId: string;

  @ApiProperty({ example: 'JOÃO DA SILVA', description: 'Nome de quem solicitou a viagem' })
  @Maiusculas()
  @IsString()
  @MinLength(3, { message: 'Solicitado por deve ter no mínimo 3 caracteres' })
  @MaxLength(200, { message: 'Solicitado por deve ter no máximo 200 caracteres' })
  solicitadoPor: string;

  @ApiProperty({ example: 'MARIA SANTOS', description: 'Nome de quem autorizou a viagem' })
  @Maiusculas()
  @IsString()
  @MinLength(3, { message: 'Autorizado por deve ter no mínimo 3 caracteres' })
  @MaxLength(200, { message: 'Autorizado por deve ter no máximo 200 caracteres' })
  autorizadoPor: string;

  @ApiPropertyOptional({ example: 'LEVAR DOCUMENTOS PARA ASSINATURA' })
  @Maiusculas()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
