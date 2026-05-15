'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { VStack, HStack, Heading, Text, Button, Icon } from '@lojascem/components-react';

interface ErroProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary global para qualquer rota não capturada por
 * error.tsx específico do segmento. Aparece quando algo quebra
 * em runtime (ex.: API fora do ar, exceção não tratada).
 */
export default function PaginaErro({ error, reset }: ErroProps) {
  useEffect(() => {
    // Em produção, registrar no serviço de telemetria
    console.error('Erro não tratado:', error);
  }, [error]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: '#f0f4ff' }}
    >
      <VStack alignItems="center" className="gap-6 text-center" style={{ maxWidth: 480 }}>
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            background: '#FEE2E2',
            color: '#DC2626',
            width: 96,
            height: 96,
          }}
        >
          <Icon name="PiWarningOctagonBold" size="xl" color="error" />
        </div>

        <VStack gap={2}>
          <Heading size="2xl" weight="bold" style={{ color: '#0a2540' }}>
            Algo deu errado
          </Heading>
          <Text size="md" style={{ color: '#64748b' }}>
            Ocorreu um erro inesperado ao processar sua requisição. A equipe
            técnica foi notificada.
          </Text>
          {error.digest && (
            <Text size="xs" className="mt-2 font-mono" style={{ color: '#94a3b8' }}>
              Código do erro: {error.digest}
            </Text>
          )}
        </VStack>

        <HStack alignItems="center" className="gap-3">
          <Button color="primary" leftIcon="PiArrowClockwiseBold" onPress={reset}>
            Tentar novamente
          </Button>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button variant="outline" color="default" leftIcon="PiHouseBold">
              Voltar ao início
            </Button>
          </Link>
        </HStack>
      </VStack>
    </main>
  );
}
