import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { CriarUsuarioDto } from './criar-usuario.dto';

export class AtualizarUsuarioDto extends PartialType(
  OmitType(CriarUsuarioDto, ['matricula'] as const),
) {
  @ApiPropertyOptional({ description: 'Nova senha (mínimo 8 caracteres). Omita para não alterar' })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  override senha?: string;
}
