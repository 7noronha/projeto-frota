import { Toast, ToastDescription, ToastTitle, VStack, useToast } from '@gluestack-ui/themed';
import type { ComponentProps } from 'react';

type Variante = 'sucesso' | 'erro' | 'info';

interface MostrarOpcoes {
  titulo: string;
  descricao?: string;
  variante?: Variante;
  duracao?: number;
}

const CORES: Record<Variante, { fundo: string; texto: string }> = {
  sucesso: { fundo: '#10B981', texto: '#FFFFFF' },
  erro: { fundo: '#DC2626', texto: '#FFFFFF' },
  info: { fundo: '#0066FF', texto: '#FFFFFF' },
};

/**
 * Hook que retorna funções para disparar toasts via Gluestack.
 * Uso:
 *   const notificar = useNotificar();
 *   notificar.sucesso({ titulo: 'Viagem iniciada' });
 */
export function useNotificar(): {
  sucesso: (opts: Omit<MostrarOpcoes, 'variante'>) => void;
  erro: (opts: Omit<MostrarOpcoes, 'variante'>) => void;
  info: (opts: Omit<MostrarOpcoes, 'variante'>) => void;
} {
  const toast = useToast();

  function mostrar(opts: MostrarOpcoes): void {
    const cor = CORES[opts.variante ?? 'info'];
    toast.show({
      placement: 'top',
      duration: opts.duracao ?? 3500,
      render: ({ id }: { id: string }) => {
        const toastProps: ComponentProps<typeof Toast> = {
          nativeID: id,
          action: opts.variante === 'erro' ? 'error' : 'success',
          variant: 'solid',
          sx: { backgroundColor: cor.fundo },
        };
        return (
          <Toast {...toastProps}>
            <VStack>
              <ToastTitle sx={{ color: cor.texto, fontWeight: '$semibold' }}>
                {opts.titulo}
              </ToastTitle>
              {opts.descricao && (
                <ToastDescription sx={{ color: cor.texto }} size="sm">
                  {opts.descricao}
                </ToastDescription>
              )}
            </VStack>
          </Toast>
        );
      },
    });
  }

  return {
    sucesso: (opts) => mostrar({ ...opts, variante: 'sucesso' }),
    erro: (opts) => mostrar({ ...opts, variante: 'erro' }),
    info: (opts) => mostrar({ ...opts, variante: 'info' }),
  };
}
