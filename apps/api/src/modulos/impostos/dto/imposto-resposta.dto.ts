import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TipoImpostoResumoDto {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
  @ApiPropertyOptional() descricao: string | null;
}

export class ImpostoRespostaDto {
  @ApiProperty() id: number;
  @ApiProperty() veiculo_id: number;
  @ApiProperty() tipo_imposto_id: number;
  @ApiProperty({ type: TipoImpostoResumoDto }) tipo_imposto: TipoImpostoResumoDto;
  @ApiProperty() data: string;
  @ApiProperty() valor: number;
  @ApiProperty() descricao: string;
  @ApiProperty() ano_exercicio: number;
  @ApiPropertyOptional() numero_parcela: number | null;
  @ApiPropertyOptional() total_parcelas: number | null;
  @ApiPropertyOptional() data_vencimento: string | null;
  @ApiPropertyOptional() observacoes: string | null;
  @ApiProperty() data_hora_criacao: string;
}
