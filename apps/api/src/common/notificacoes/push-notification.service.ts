import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface PushPayload {
  titulo: string;
  corpo: string;
  /** Dados extras pra deep-link no app (ex: { tela: 'viagem', id: 'uuid' }) */
  dados?: Record<string, unknown>;
}

interface ExpoPushResposta {
  data?: Array<{
    status: 'ok' | 'error';
    id?: string;
    message?: string;
    details?: { error?: string };
  }>;
}

/**
 * Envia notificações push via Expo Push API.
 *
 * O token Expo (ExponentPushToken[...]) é registrado pelo app no login
 * (rota PATCH /usuarios/me/push-token). Aqui só consumimos.
 *
 * Tolerante a falha: log + segue. Não bloqueia o fluxo de negócio que
 * disparou a notificação (criar viagem, etc).
 *
 * Limites do Expo Push: 600 notificações/segundo, sem cadastro adicional
 * pra apps standalone publicados pelo EAS Build.
 */
@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private readonly endpoint = 'https://exp.host/--/api/v2/push/send';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Envia push pra um usuário específico (se ele tiver token registrado).
   * Retorna true se a chamada à Expo retornou ok, false caso contrário ou
   * se o usuário não tem token.
   */
  async enviarParaUsuario(usuarioId: string, payload: PushPayload): Promise<boolean> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { expoPushToken: true, nome: true },
    });

    if (!usuario?.expoPushToken) {
      this.logger.debug(`Usuário ${usuarioId} sem expoPushToken — push ignorado`);
      return false;
    }

    return this.enviarParaToken(usuario.expoPushToken, payload, usuario.nome);
  }

  /**
   * Envia pra múltiplos usuários numa única chamada (Expo aceita array
   * de até 100 messages). Útil pra alertas em massa (CNH vencendo, etc).
   */
  async enviarParaUsuarios(usuarioIds: string[], payload: PushPayload): Promise<number> {
    if (usuarioIds.length === 0) return 0;
    const usuarios = await this.prisma.usuario.findMany({
      where: { id: { in: usuarioIds }, expoPushToken: { not: null } },
      select: { id: true, expoPushToken: true },
    });

    const mensagens = usuarios.map((u) => ({
      to: u.expoPushToken,
      title: payload.titulo,
      body: payload.corpo,
      data: payload.dados ?? {},
      sound: 'default' as const,
      priority: 'high' as const,
    }));

    if (mensagens.length === 0) return 0;

    try {
      const resposta = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(mensagens),
      });
      if (!resposta.ok) {
        this.logger.warn(`Expo respondeu ${resposta.status} ao enviar batch`);
        return 0;
      }
      const dados = (await resposta.json()) as ExpoPushResposta;
      const ok = dados.data?.filter((d) => d.status === 'ok').length ?? 0;
      const erros = dados.data?.filter((d) => d.status === 'error') ?? [];
      if (erros.length > 0) {
        this.logger.warn(`Expo retornou ${erros.length} erros: ${JSON.stringify(erros).slice(0, 300)}`);
      }
      return ok;
    } catch (erro) {
      this.logger.error(
        `Falha ao enviar batch de push: ${erro instanceof Error ? erro.message : 'erro'}`,
      );
      return 0;
    }
  }

  private async enviarParaToken(
    token: string,
    payload: PushPayload,
    nome?: string,
  ): Promise<boolean> {
    try {
      const resposta = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          to: token,
          title: payload.titulo,
          body: payload.corpo,
          data: payload.dados ?? {},
          sound: 'default',
          priority: 'high',
        }),
      });
      if (!resposta.ok) {
        this.logger.warn(`Expo respondeu ${resposta.status} para ${nome ?? token}`);
        return false;
      }
      const dados = (await resposta.json()) as ExpoPushResposta;
      const status = dados.data?.[0]?.status;
      if (status !== 'ok') {
        this.logger.warn(
          `Expo recusou push para ${nome ?? token}: ${dados.data?.[0]?.message ?? 'sem detalhes'}`,
        );
        return false;
      }
      return true;
    } catch (erro) {
      this.logger.error(
        `Falha ao enviar push para ${nome ?? token}: ${erro instanceof Error ? erro.message : 'erro'}`,
      );
      return false;
    }
  }
}
