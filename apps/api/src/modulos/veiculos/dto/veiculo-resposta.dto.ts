import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SituacaoResumoDto {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
  @ApiPropertyOptional() descricao: string | null;
}

export class VeiculoRespostaDto {
  @ApiProperty() id: number;
  @ApiProperty() placa: string;
  @ApiProperty() marca: string;
  @ApiProperty() modelo: string;
  @ApiProperty() ano_fabricacao: number;
  @ApiProperty() ano_modelo: number;
  @ApiProperty() cor: string;
  @ApiProperty() renavam: string;
  @ApiProperty() odometro_atual: number;
  @ApiProperty() data_aquisicao: string;
  @ApiProperty() situacao_id: number;
  @ApiProperty({ type: SituacaoResumoDto }) situacao: SituacaoResumoDto;
  @ApiPropertyOptional() observacoes: string | null;
  @ApiProperty() data_hora_criacao: string;
}
