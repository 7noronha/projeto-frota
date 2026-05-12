import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DespesaRespostaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  veiculoId: string;

  @ApiProperty({ example: 'multa' })
  tipo: string;

  @ApiProperty({ example: '2026-05-12' })
  data: string;

  @ApiProperty({ example: 350.5 })
  valor: number;

  @ApiProperty()
  descricao: string;

  @ApiPropertyOptional()
  observacoes: string | null;

  @ApiPropertyOptional()
  odometro: number | null;

  @ApiPropertyOptional()
  litros: number | null;

  @ApiPropertyOptional()
  precoLitro: number | null;

  @ApiPropertyOptional()
  tipoCombustivel: string | null;

  @ApiPropertyOptional()
  tipoManutencao: string | null;

  @ApiPropertyOptional()
  oficina: string | null;

  @ApiPropertyOptional()
  numeroAuto: string | null;

  @ApiPropertyOptional()
  gravidade: string | null;

  @ApiPropertyOptional()
  pontosCnh: number | null;

  @ApiPropertyOptional()
  dataVencimento: string | null;

  @ApiProperty()
  dataCriacao: string;
}
