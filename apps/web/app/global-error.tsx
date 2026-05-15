'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Fallback de último recurso — só é renderizado quando o próprio
 * root layout quebra (ex.: Providers crashou). NÃO pode usar
 * componentes da lib lojascem aqui porque o ThemeProvider/Toaster
 * não estão disponíveis.
 *
 * Renderiza <html> e <body> próprios, conforme requerido pelo Next 15.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Erro fatal na raiz da aplicação:', error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          background: '#0a2540',
          color: '#ffffff',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <main
          style={{
            maxWidth: 480,
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            padding: '40px 32px',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#DC2626',
              marginBottom: 16,
              lineHeight: 1,
            }}
          >
            !
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', color: '#ffffff' }}>
            Falha crítica
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 24px', lineHeight: 1.5 }}>
            A aplicação encontrou um erro irrecuperável. Recarregue a página
            ou contate o suporte técnico se o problema persistir.
          </p>

          {error.digest && (
            <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0 24px' }}>
              ID: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              background: '#0066FF',
              color: '#ffffff',
              border: 'none',
              borderRadius: 9999,
              padding: '12px 32px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tentar recarregar
          </button>
        </main>
      </body>
    </html>
  );
}
