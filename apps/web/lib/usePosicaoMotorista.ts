'use client';

import { useEffect, useState } from 'react';

export interface PosicaoMotorista {
  latitude: number;
  longitude: number;
  precisaoM: number | null;
  capturadoEm: string;
}

interface Opcoes {
  /** ID da viagem; quando null/undefined o hook fica inativo. */
  viagemId: string | null | undefined;
  /** Polling ativo (ex.: só EM_ANDAMENTO). False = no-op. */
  ativo: boolean;
  /** Intervalo de polling em ms. Default 30s. */
  intervaloMs?: number;
}

const INTERVALO_PADRAO_MS = 30_000;

/**
 * Busca a posição mais recente do motorista a cada N segundos enquanto
 * a viagem está EM_ANDAMENTO. Operador no web vê o pin se mover em
 * quase-tempo-real.
 *
 * Idempotente: se a tela ficar aberta, o hook continua atualizando.
 * Falhas de rede são silenciosas (mantém último valor conhecido).
 */
export function usePosicaoMotorista({
  viagemId,
  ativo,
  intervaloMs = INTERVALO_PADRAO_MS,
}: Opcoes): PosicaoMotorista | null {
  const [posicao, setPosicao] = useState<PosicaoMotorista | null>(null);

  useEffect(() => {
    if (!ativo || !viagemId) {
      setPosicao(null);
      return;
    }

    let cancelado = false;

    async function buscar(): Promise<void> {
      try {
        const resp = await fetch(`/api/viagens/${viagemId}/posicoes?limite=1`, {
          cache: 'no-store',
        });
        if (!resp.ok) return;
        const dados = (await resp.json()) as PosicaoMotorista[];
        if (cancelado) return;
        const ultima = dados[0];
        if (ultima) setPosicao(ultima);
      } catch {
        // Silencioso — mantém último valor conhecido
      }
    }

    // Primeira leitura imediata
    void buscar();
    const id = setInterval(() => void buscar(), intervaloMs);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [viagemId, ativo, intervaloMs]);

  return posicao;
}
