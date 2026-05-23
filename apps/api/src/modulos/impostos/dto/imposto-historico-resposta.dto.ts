import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ImpostoHistoricoRespostaDto {
  @ApiProperty() id: number;
  @ApiProperty() imposto_id: number;
  @ApiProperty() campo: string;
  @ApiPropertyOptional() valor_anterior: string | null;
  @ApiPropertyOptional() valor_novo: string | null;
  @ApiPropertyOptional() alterado_por: number | null;
  @ApiProperty() data_hora_alteracao: string;
}
