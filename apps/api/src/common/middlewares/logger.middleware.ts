import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { agoraBrasilia } from '@fleetops/utils/datetime';

const CAMPOS_SENSIVEIS = ['senha', 'password', 'token', 'authorization'];

interface UsuarioReq {
  sub?: string;
  matricula?: string;
}

function sanitizarBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const copia: Record<string, unknown> = { ...(body as Record<string, unknown>) };
  for (const campo of CAMPOS_SENSIVEIS) {
    if (campo in copia) copia[campo] = '***';
  }
  return copia;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void): void {
    const inicioMs = Date.now();
    const reqFastify = req as unknown as FastifyRequest & {
      routerPath?: string;
      body?: unknown;
      query?: unknown;
      params?: unknown;
      user?: UsuarioReq;
    };

    res.on('finish', () => {
      const dataHora = agoraBrasilia();
      const usuario = reqFastify.user ?? null;

      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({
          dataHora,
          duracaoMs: Date.now() - inicioMs,
          ip: req.socket.remoteAddress,
          method: req.method,
          path: reqFastify.routerPath ?? req.url,
          url: req.url,
          status: res.statusCode,
          body: sanitizarBody(reqFastify.body),
          query: reqFastify.query,
          params: reqFastify.params,
          userId: usuario?.sub ?? null,
          matricula: usuario?.matricula ?? null,
          message: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : null,
        }),
      );
    });

    next();
  }
}
