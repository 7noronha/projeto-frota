import { Pressable, Text } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { removerToken } from '@/lib/auth';

/**
 * Botão pequeno renderizado no headerRight para sair da conta.
 * Pré-confirma com Alert nativo? Não — operação rápida e reversível
 * (basta logar de novo). Comportamento idêntico ao "Sair" da web.
 */
export function BotaoSairHeader(): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function aoSair(): Promise<void> {
    await removerToken();
    queryClient.clear();
    router.replace('/login');
  }

  return (
    <Pressable onPress={aoSair} accessibilityLabel="Sair da conta" hitSlop={8}>
      <Text color="$white" fontWeight="$semibold" size="sm">
        Sair
      </Text>
    </Pressable>
  );
}
