import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TipoManutencaoResumoDto {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
  @ApiPropertyOptional() descricao: string | null;
}

export class ManutencaoRespostaDto {
  @ApiProperty() id: number;
  @ApiProperty() veiculo_id: number;
  @ApiProperty() tipo_manutencao_id: number;
  @ApiProperty({ type: TipoManutencaoResumoDto }) tipo_manutencao: TipoManutencaoResumoDto;
  @ApiProperty() data: string;
  @ApiProperty() valor: number;
  @ApiProperty() descricao: string;
  @ApiPropertyOptional() oficina: string | null;
  @ApiPropertyOptional() odometro: number | null;
  @ApiPropertyOptional() observacoes: string | null;
  @ApiProperty() data_hora_criacao: string;
}
