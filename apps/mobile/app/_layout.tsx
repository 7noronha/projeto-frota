import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErroApi, registrarHandlerNaoAutenticado } from '@/lib/api';

// Aviso emitido pelo Gluestack UI v1 (componente SafeAreaView interno usa o
// SafeAreaView depreciado do react-native). Nosso codigo usa
// react-native-safe-area-context corretamente; o ruido some na futura
// migracao para o Gluestack v2.
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

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
