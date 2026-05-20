import { Logger } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { agoraBrasilia } from '@fleetops/utils/datetime';

const CAMPOS_SENSIVEIS = ['senha', 'password', 'token', 'authorization', 'senhaHash'];

interface UsuarioReq {
  sub?: string;
  matricula?: string;
}

interface RequisicaoComExtras {
  inicioMs?: number;
  errorMessage?: string;
  user?: UsuarioReq;
  ip?: string;
  method?: string;
  url?: string;
  body?: unknown;
  query?: unknown;
  params?: unknown;
  routeOptions?: { url?: string };
}

interface RespostaComExtras {
  statusCode: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    inicioMs?: number;
    errorMessage?: string;
    user?: UsuarioReq;
  }
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

// Em produção, request 2xx só vai pro log se passar deste limite (ms).
// Em dev, loga tudo. Evita CPU + I/O com JSON.stringify de payloads grandes.
const LIMITE_LOG_OK_MS = 500;
const EH_PRODUCAO = process.env.NODE_ENV === 'production';

export function registrarLoggerHttp(app: NestFastifyApplication): void {
  const logger = new Logger('HTTP');
  const instancia = app.getHttpAdapter().getInstance();

  instancia.addHook('onRequest', (req: RequisicaoComExtras, _res: RespostaComExtras, done: () => void) => {
    req.inicioMs = Date.now();
    done();
  });

  instancia.addHook('onResponse', (req: RequisicaoComExtras, res: RespostaComExtras, done: () => void) => {
    const status = res.statusCode;
    const duracaoMs = req.inicioMs ? Date.now() - req.inicioMs : 0;

    // Atalho em produção: 2xx rápido vira no-op (não monta JSON nem chama Logger).
    if (EH_PRODUCAO && status < 400 && duracaoMs < LIMITE_LOG_OK_MS) {
      done();
      return;
    }

    const registro = {
      dataHora: agoraBrasilia(),
      duracaoMs,
      ip: req.ip ?? null,
      method: req.method ?? null,
      path: req.routeOptions?.url ?? req.url ?? null,
      url: req.url ?? null,
      status,
      body: sanitizar(req.body),
      query: sanitizar(req.query),
      params: req.params ?? {},
      userId: req.user?.sub ?? null,
      matricula: req.user?.matricula ?? null,
      message: req.errorMessage ?? (status >= 400 ? `HTTP ${status}` : null),
    };

    const linha = JSON.stringify(registro);
    if (status >= 500) {
      logger.error(linha);
    } else if (status >= 400) {
      logger.warn(linha);
    } else {
      logger.log(linha);
    }

    done();
  });
}
