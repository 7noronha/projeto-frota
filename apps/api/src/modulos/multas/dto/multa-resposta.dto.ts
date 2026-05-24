import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class GravidadeResumoDto {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
  @ApiPropertyOptional() descricao: string | null;
}

export class MultaRespostaDto {
  @ApiProperty() id: number;
  @ApiProperty() veiculo_id: number;
  @ApiProperty() gravidade_multa_id: number;
  @ApiProperty({ type: GravidadeResumoDto }) gravidade: GravidadeResumoDto;
  @ApiProperty() data: string;
  @ApiProperty() valor: number;
  @ApiProperty() descricao: string;
  @ApiPropertyOptional() numero_auto: string | null;
  @ApiPropertyOptional() pontos_cnh: number | null;
  @ApiPropertyOptional() data_vencimento: string | null;
  @ApiPropertyOptional() observacoes: string | null;
  @ApiProperty() data_hora_criacao: string;
}
