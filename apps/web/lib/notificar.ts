'use client';

import { toast } from '@lojascem/components-react';

/**
 * Helpers de notificação padronizada. Mantém um tom de voz único
 * em toda a aplicação e centraliza opções (duração, posição, etc).
 */
export const notificar = {
  sucesso(mensagem: string): void {
    toast.success(mensagem, { duration: 3500 });
  },
  erro(mensagem: string): void {
    toast.error(mensagem, { duration: 5000 });
  },
  info(mensagem: string): void {
    toast.info(mensagem, { duration: 3500 });
  },
};
