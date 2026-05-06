import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '0009003656', description: 'Matrícula funcional (10 dígitos)' })
  @IsString()
  @Length(10, 10, { message: 'Matrícula deve ter exatamente 10 dígitos' })
  @Matches(/^\d{10}$/, { message: 'Matrícula deve conter apenas dígitos numéricos' })
  matricula: string;

  @ApiProperty({ example: 'MinhaS3nha!', description: 'Senha (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  senha: string;
}
