import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { agoraBrasilia } from '@fleetops/utils/datetime';

interface RequisicaoComErro extends FastifyRequest {
  errorMessage?: string;
}

@Catch()
export class TodasExcecoesFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExcecaoNaoTratada');

  catch(excecao: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const resposta = ctx.getResponse<FastifyReply>();
    const requisicao = ctx.getRequest<RequisicaoComErro>();

    const ehHttpException = excecao instanceof HttpException;
    const status = ehHttpException
      ? excecao.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const corpoErro = ehHttpException
      ? excecao.getResponse()
      : { message: 'Erro interno do servidor' };

    const mensagem = this.extrairMensagem(corpoErro);

    // Disponibiliza a mensagem para o hook onResponse capturar no log
    requisicao.errorMessage = mensagem;

    // Loga stack trace de erros 500
    if (!ehHttpException) {
      this.logger.error(
        excecao instanceof Error ? excecao.stack : String(excecao),
      );
    }

    void resposta.status(status).send({
      statusCode: status,
      timestamp: agoraBrasilia(),
      path: requisicao.url,
      message: mensagem,
    });
  }

  private extrairMensagem(corpo: unknown): string {
    if (typeof corpo === 'string') return corpo;
    if (corpo && typeof corpo === 'object' && 'message' in corpo) {
      const msg = (corpo as { message: unknown }).message;
      if (Array.isArray(msg)) return msg[0] ?? 'Erro de validação';
      if (typeof msg === 'string') return msg;
    }
    return 'Erro desconhecido';
  }
}
