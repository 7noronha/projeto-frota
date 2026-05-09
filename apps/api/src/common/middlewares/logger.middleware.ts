import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
import { agoraBrasilia } from '@fleetops/utils/datetime';

const CAMPOS_SENSIVEIS = ['senha', 'password', 'token', 'authorization', 'senhaHash'];

interface UsuarioReq {
  sub?: string;
  matricula?: string;
}

interface RequisicaoFastifyExtra {
  routerPath?: string;
  body?: unknown;
  query?: unknown;
  params?: unknown;
  user?: UsuarioReq;
  ip?: string;
  errorMessage?: string;
}

function sanitizar(valor: unknown): unknown {
  if (!valor || typeof valor !== 'object') return valor;
  const copia: Record<string, unknown> = { ...(valor as Record<string, unknown>) };
  for (const campo of Object.keys(copia)) {
    if (CAMPOS_SENSIVEIS.includes(campo)) {
      copia[campo] = '***';
    }
  }
  return copia;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: IncomingMessage, res: ServerResponse, next: () => void): void {
    const inicioMs = Date.now();
    const reqFastify = req as unknown as FastifyRequest & RequisicaoFastifyExtra;

    res.on('finish', () => {
      const dataHora = agoraBrasilia();
      const usuario = reqFastify.user ?? null;
      const status = res.statusCode;
      const duracaoMs = Date.now() - inicioMs;

      const registro = {
        dataHora,
        duracaoMs,
        ip: reqFastify.ip ?? req.socket.remoteAddress ?? null,
        method: req.method,
        path: reqFastify.routerPath ?? req.url,
        url: req.url,
        status,
        body: sanitizar(reqFastify.body),
        query: reqFastify.query,
        params: reqFastify.params,
        userId: usuario?.sub ?? null,
        matricula: usuario?.matricula ?? null,
        message: reqFastify.errorMessage ?? (status >= 400 ? `HTTP ${status}` : null),
      };

      const linha = JSON.stringify(registro);
      if (status >= 500) {
        this.logger.error(linha);
      } else if (status >= 400) {
        this.logger.warn(linha);
      } else {
        this.logger.log(linha);
      }
    });

    next();
  }
}
