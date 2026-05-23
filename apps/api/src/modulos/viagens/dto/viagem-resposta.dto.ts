import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class MotoristaResumidoDto {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
  @ApiProperty() matricula: string;
}

class VeiculoResumidoDto {
  @ApiProperty() id: number;
  @ApiProperty() placa: string;
  @ApiProperty() marca: string;
  @ApiProperty() modelo: string;
  @ApiProperty() odometro_atual: number;
}

class StatusResumoDto {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
  @ApiPropertyOptional() descricao: string | null;
}

export class ViagemRespostaDto {
  @ApiProperty() id: number;
  @ApiProperty() origem: string;
  @ApiProperty() destino: string;
  @ApiPropertyOptional({ example: -23.561414 }) origem_latitude: number | null;
  @ApiPropertyOptional({ example: -46.655881 }) origem_longitude: number | null;
  @ApiPropertyOptional({ example: -23.55052 }) destino_latitude: number | null;
  @ApiPropertyOptional({ example: -46.633308 }) destino_longitude: number | null;
  @ApiPropertyOptional({ description: 'GeoJSON LineString da rota Mapbox Directions' })
  rota_geometria: unknown | null;
  @ApiPropertyOptional({ example: 920.4 }) rota_distancia_km: number | null;
  @ApiPropertyOptional({ example: 720 }) rota_duracao_min: number | null;
  @ApiPropertyOptional({ example: 65.5 }) velocidade_media_km_h: number | null;
  @ApiProperty() data_viagem: string;
  @ApiProperty() hora_inicio_prevista: string;
  @ApiProperty() hora_fim_prevista: string;
  @ApiPropertyOptional() data_hora_inicio_real: string | null;
  @ApiPropertyOptional() data_hora_fim_real: string | null;
  @ApiPropertyOptional() odometro_inicial: number | null;
  @ApiPropertyOptional() odometro_final: number | null;
  @ApiPropertyOptional() distancia_percorrida: number | null;
  @ApiProperty() motorista_id: number;
  @ApiProperty({ type: MotoristaResumidoDto }) motorista: MotoristaResumidoDto;
  @ApiProperty() veiculo_id: number;
  @ApiProperty({ type: VeiculoResumidoDto }) veiculo: VeiculoResumidoDto;
  @ApiProperty() operador_criador_id: number;
  @ApiProperty() solicitado_por: string;
  @ApiProperty() autorizado_por: string;
  @ApiPropertyOptional() observacoes: string | null;
  @ApiProperty() status_id: number;
  @ApiProperty({ type: StatusResumoDto }) status: StatusResumoDto;
  @ApiProperty() data_hora_criacao: string;
}
