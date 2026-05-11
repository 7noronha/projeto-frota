import { ApiProperty } from '@nestjs/swagger';

export class ConfiguracaoRespostaDto {
  @ApiProperty({ example: 'endereco_sede' })
  chave: string;

  @ApiProperty({ example: 'RUA DA SEDE, 1 — CENTRO, BRASÍLIA, DF' })
  valor: string;

  @ApiProperty({ example: '2026-05-11T08:00:00' })
  dataAtualizacao: Date;
}
