import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { UsuarioJwt } from '@fleetops/types';

export const UsuarioAutenticado = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioJwt => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest & { user: UsuarioJwt }>();
    return request.user;
  },
);
