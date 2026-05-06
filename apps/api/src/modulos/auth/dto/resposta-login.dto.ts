import { ApiProperty } from '@nestjs/swagger';
import { Perfil } from '@fleetops/types';

class DadosUsuarioDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  matricula: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  perfil: Perfil;
}

export class RespostaLoginDto {
  @ApiProperty({ description: 'Token JWT com validade de 7 dias' })
  token: string;

  @ApiProperty({ type: DadosUsuarioDto })
  usuario: DadosUsuarioDto;
}
