import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

/**
 * DTO usado pelo próprio usuário para atualizar seu perfil.
 * NÃO permite alterar matrícula, nome, perfil ou status (esses
 * são privilégio do admin via PUT /usuarios/:id).
 *
 * Para trocar senha, o usuário deve informar a senhaAtual.
 */
export class AtualizarPerfilDto {
  @ApiPropertyOptional({ example: 'usuario@empresa.com' })
  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(200, { message: 'E-mail deve ter no máximo 200 caracteres' })
  email?: string;

  @ApiPropertyOptional({ example: '(61) 99999-0000' })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Telefone deve ter no máximo 20 caracteres' })
  telefone?: string;

  @ApiPropertyOptional({ description: 'Obrigatória ao informar novaSenha' })
  @ValidateIf((o: AtualizarPerfilDto) => o.novaSenha !== undefined)
  @IsString()
  @MinLength(1, { message: 'Informe sua senha atual para alterar a senha' })
  senhaAtual?: string;

  @ApiPropertyOptional({ description: 'Mínimo 8 caracteres' })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Nova senha deve ter no mínimo 8 caracteres' })
  @MaxLength(100)
  novaSenha?: string;
}
