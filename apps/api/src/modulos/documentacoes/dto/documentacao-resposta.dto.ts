import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TipoDocumentoResumoDto {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
  @ApiPropertyOptional() descricao: string | null;
}

export class DocumentacaoRespostaDto {
  @ApiProperty() id: number;
  @ApiProperty() veiculo_id: number;
  @ApiProperty() tipo_documento_veiculo_id: number;
  @ApiProperty({ type: TipoDocumentoResumoDto }) tipo_documento: TipoDocumentoResumoDto;
  @ApiProperty() data: string;
  @ApiProperty() valor: number;
  @ApiProperty() descricao: string;
  @ApiPropertyOptional() data_vencimento: string | null;
  @ApiPropertyOptional() observacoes: string | null;
  @ApiProperty() data_hora_criacao: string;
}
