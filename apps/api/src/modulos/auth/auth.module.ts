import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

function jwtFactory(): JwtModuleOptions {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não configurado');
  const expiracao = process.env.JWT_EXPIRATION ?? '7d';
  return {
    secret,
    // @ts-expect-error — StringValue do pacote ms não aceita string genérica, mas o valor é válido
    signOptions: { expiresIn: expiracao },
  };
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [],
      useFactory: jwtFactory,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
