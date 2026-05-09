import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

const maiusculas = () => Transform(({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value,
);

export class CriarViagemDto {
  @ApiProperty({ example: 'AV. PAULISTA, 1000 — SÃO PAULO, SP', description: 'Endereço de destino' })
  @maiusculas()
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

  @ApiProperty({ example: 'JOÃO DA SILVA', description: 'Nome de quem solicitou a viagem' })
  @maiusculas()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  solicitadoPor: string;

  @ApiProperty({ example: 'MARIA SANTOS', description: 'Nome de quem autorizou a viagem' })
  @maiusculas()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  autorizadoPor: string;

  @ApiPropertyOptional({ example: 'LEVAR DOCUMENTOS PARA ASSINATURA' })
  @maiusculas()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
