import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class CriarViagemDto {
  @ApiProperty({ example: 'Av. Paulista, 1000 — São Paulo, SP', description: 'Endereço de destino' })
  @IsString()
  @MinLength(5, { message: 'Destino deve ter no mínimo 5 caracteres' })
  @MaxLength(500)
  destino: string;

  @ApiProperty({ example: '2026-05-10', description: 'Data da viagem (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Data da viagem inválida' })
  dataViagem: string;

  @ApiProperty({ example: '08:00', description: 'Hora planejada de início (HH:MM)' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Hora de início deve estar no formato HH:MM' })
  horaInicioPrevista: string;

  @ApiProperty({ example: '12:00', description: 'Hora planejada de fim (HH:MM)' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Hora de fim deve estar no formato HH:MM' })
  horaFimPrevista: string;

  @ApiProperty({ example: 'uuid-do-motorista' })
  @IsUUID('4', { message: 'motoristaId inválido' })
  motoristaId: string;

  @ApiProperty({ example: 'uuid-do-veiculo' })
  @IsUUID('4', { message: 'veiculoId inválido' })
  veiculoId: string;

  @ApiProperty({ example: 'João da Silva', description: 'Nome de quem solicitou a viagem' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  solicitadoPor: string;

  @ApiProperty({ example: 'Maria Santos', description: 'Nome de quem autorizou a viagem' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  autorizadoPor: string;

  @ApiPropertyOptional({ example: 'Levar documentos para assinatura' })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
