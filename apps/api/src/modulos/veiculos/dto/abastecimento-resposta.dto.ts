import { ApiProperty } from '@nestjs/swagger';

export class AbastecimentoRespostaDto {
  @ApiProperty() id: number;
  @ApiProperty() veiculo_id: number;
  @ApiProperty({ example: 'abastecimento' }) tipo: string;
  @ApiProperty({ example: '2026-05-19' }) data: string;
  @ApiProperty({ example: 287.5 }) valor: number;
  @ApiProperty({ example: 42.137 }) litros: number;
  @ApiProperty({ example: 6.829 }) preco_litro: number;
  @ApiProperty({ example: 'gasolina' }) tipo_combustivel: string;
  @ApiProperty({ nullable: true, example: 152340 }) odometro: number | null;
  @ApiProperty() descricao: string;
  @ApiProperty() data_hora_criacao: string;
}
