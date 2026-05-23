import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TipoCoberturaResumoDto {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
  @ApiPropertyOptional() descricao: string | null;
}

export class SeguroRespostaDto {
  @ApiProperty() id: number;
  @ApiProperty() veiculo_id: number;
  @ApiProperty() tipo_cobertura_seguro_id: number;
  @ApiProperty({ type: TipoCoberturaResumoDto }) tipo_cobertura: TipoCoberturaResumoDto;
  @ApiProperty() data: string;
  @ApiProperty() valor: number;
  @ApiProperty() descricao: string;
  @ApiProperty() seguradora: string;
  @ApiPropertyOptional() numero_apolice: string | null;
  @ApiProperty() vigencia_inicio: string;
  @ApiProperty() vigencia_fim: string;
  @ApiPropertyOptional() observacoes: string | null;
  @ApiProperty() data_hora_criacao: string;
}
