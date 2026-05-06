import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { Perfil, UsuarioJwt } from '@fleetops/types';
import { PERFIS_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfisPermitidos = this.reflector.getAllAndOverride<Perfil[]>(PERFIS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!perfisPermitidos || perfisPermitidos.length === 0) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest & { user: UsuarioJwt }>();
    const usuario = request.user;

    return perfisPermitidos.includes(usuario.perfil);
  }
}
