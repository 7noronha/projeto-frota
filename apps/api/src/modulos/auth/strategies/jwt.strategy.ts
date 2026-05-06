import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioJwt } from '@fleetops/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não configurado');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: UsuarioJwt): UsuarioJwt {
    if (!payload.sub || !payload.matricula || !payload.perfil) {
      throw new UnauthorizedException('Token inválido');
    }
    return payload;
  }
}
