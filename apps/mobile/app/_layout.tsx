// IMPORTANTE: este import precisa ser o PRIMEIRO de todos — ele sobrescreve
// console.warn antes de o barrel do @gluestack-ui/themed importar o
// SafeAreaView depreciado do react-native.
import '@/silenciar-avisos';
import { useEffect } from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErroApi, registrarHandlerNaoAutenticado } from '@/lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, erro) => {
        // Não retentar 401 (sessão expirada — handler já redirecionou) nem 403
        if (erro instanceof ErroApi && (erro.status === 401 || erro.status === 403)) {
          return false;
        }
        return count < 1;
      },
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    registrarHandlerNaoAutenticado(() => {
      queryClient.clear();
      router.replace('/login');
    });
  }, [router]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <GluestackUIProvider config={config}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(motorista)" />
          </Stack>
          <StatusBar style="light" />
        </GluestackUIProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
