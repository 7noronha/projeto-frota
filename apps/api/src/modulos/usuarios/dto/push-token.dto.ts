import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RegistrarPushTokenDto {
  @ApiProperty({
    example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxx]',
    description: 'Token Expo Push do dispositivo. Null/string vazia desregistra.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Token excede tamanho máximo' })
  token?: string | null;
}
