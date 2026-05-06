import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Perfil } from '@fleetops/types';

export class UsuarioRespostaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  matricula: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  perfil: Perfil;

  @ApiPropertyOptional()
  email: string | null;

  @ApiPropertyOptional()
  telefone: string | null;

  @ApiPropertyOptional()
  cnh: string | null;

  @ApiPropertyOptional()
  cnhValidade: string | null;

  @ApiProperty()
  ativo: boolean;

  @ApiProperty()
  dataCriacao: string;
}
