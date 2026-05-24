import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PerfilResumoDto {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
  @ApiPropertyOptional() descricao: string | null;
}

export class UsuarioRespostaDto {
  @ApiProperty() id: number;
  @ApiProperty() matricula: string;
  @ApiProperty() nome: string;
  @ApiProperty() perfil_id: number;
  @ApiProperty({ type: PerfilResumoDto }) perfil: PerfilResumoDto;
  @ApiPropertyOptional() email: string | null;
  @ApiPropertyOptional() telefone: string | null;
  @ApiPropertyOptional() cnh: string | null;
  @ApiPropertyOptional() cnh_validade: string | null;
  @ApiProperty() ativo: boolean;
  @ApiProperty() data_hora_criacao: string;
}
