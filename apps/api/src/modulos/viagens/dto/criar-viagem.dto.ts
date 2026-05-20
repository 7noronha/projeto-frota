import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min, MinLength, IsNotEmpty } from 'class-validator';
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

  // ─── GPS (Fase 1) — coordenadas opcionais ─────────────────────────────────
  @ApiPropertyOptional({ example: -23.561414, description: 'Latitude da origem' })
  @IsOptional()
  @IsNumber({}, { message: 'origemLatitude inválida' })
  @Min(-90, { message: 'origemLatitude deve estar entre -90 e 90' })
  @Max(90, { message: 'origemLatitude deve estar entre -90 e 90' })
  origemLatitude?: number;

  @ApiPropertyOptional({ example: -46.655881, description: 'Longitude da origem' })
  @IsOptional()
  @IsNumber({}, { message: 'origemLongitude inválida' })
  @Min(-180, { message: 'origemLongitude deve estar entre -180 e 180' })
  @Max(180, { message: 'origemLongitude deve estar entre -180 e 180' })
  origemLongitude?: number;

  @ApiPropertyOptional({ example: -23.55052, description: 'Latitude do destino' })
  @IsOptional()
  @IsNumber({}, { message: 'destinoLatitude inválida' })
  @Min(-90, { message: 'destinoLatitude deve estar entre -90 e 90' })
  @Max(90, { message: 'destinoLatitude deve estar entre -90 e 90' })
  destinoLatitude?: number;

  @ApiPropertyOptional({ example: -46.633308, description: 'Longitude do destino' })
  @IsOptional()
  @IsNumber({}, { message: 'destinoLongitude inválida' })
  @Min(-180, { message: 'destinoLongitude deve estar entre -180 e 180' })
  @Max(180, { message: 'destinoLongitude deve estar entre -180 e 180' })
  destinoLongitude?: number;
}
