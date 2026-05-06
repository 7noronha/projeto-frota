import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusViagem } from '@fleetops/types';

class MotoristaResumidoDto {
  @ApiProperty() id: string;
  @ApiProperty() nome: string;
  @ApiProperty() matricula: string;
}

class VeiculoResumidoDto {
  @ApiProperty() id: string;
  @ApiProperty() placa: string;
  @ApiProperty() marca: string;
  @ApiProperty() modelo: string;
  @ApiProperty() odometroAtual: number;
}

export class ViagemRespostaDto {
  @ApiProperty() id: string;
  @ApiProperty() origem: string;
  @ApiProperty() destino: string;
  @ApiProperty() dataViagem: string;
  @ApiProperty() horaInicioPrevista: string;
  @ApiProperty() horaFimPrevista: string;
  @ApiPropertyOptional() dataHoraInicioReal: string | null;
  @ApiPropertyOptional() dataHoraFimReal: string | null;
  @ApiPropertyOptional() odometroInicial: number | null;
  @ApiPropertyOptional() odometroFinal: number | null;
  @ApiPropertyOptional() distanciaPercorrida: number | null;
  @ApiProperty() motoristaId: string;
  @ApiProperty({ type: MotoristaResumidoDto }) motorista: MotoristaResumidoDto;
  @ApiProperty() veiculoId: string;
  @ApiProperty({ type: VeiculoResumidoDto }) veiculo: VeiculoResumidoDto;
  @ApiProperty() operadorCriadorId: string;
  @ApiProperty() solicitadoPor: string;
  @ApiProperty() autorizadoPor: string;
  @ApiPropertyOptional() observacoes: string | null;
  @ApiProperty() status: StatusViagem;
  @ApiProperty() dataCriacao: string;
}
