import { ApiProperty } from '@nestjs/swagger';

class DadosUsuarioDto {
  @ApiProperty() id: number;
  @ApiProperty() matricula: string;
  @ApiProperty() nome: string;
  @ApiProperty() perfil: string;
}

export class RespostaLoginDto {
  @ApiProperty({ description: 'Token JWT com validade de 7 dias' })
  token: string;

  @ApiProperty({ type: DadosUsuarioDto })
  usuario: DadosUsuarioDto;
}
