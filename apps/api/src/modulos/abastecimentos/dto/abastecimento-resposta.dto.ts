import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TipoCombustivelResumoDto {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
  @ApiPropertyOptional() descricao: string | null;
}

export class AbastecimentoRespostaDto {
  @ApiProperty() id: number;
  @ApiProperty() veiculo_id: number;
  @ApiProperty() tipo_combustivel_id: number;
  @ApiProperty({ type: TipoCombustivelResumoDto }) tipo_combustivel: TipoCombustivelResumoDto;
  @ApiProperty() data: string;
  @ApiProperty() valor: number;
  @ApiProperty() descricao: string;
  @ApiProperty() litros: number;
  @ApiProperty() preco_litro: number;
  @ApiPropertyOptional() odometro: number | null;
  @ApiPropertyOptional() observacoes: string | null;
  @ApiProperty() data_hora_criacao: string;
}
