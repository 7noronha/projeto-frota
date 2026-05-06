import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  return (
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
  );
}
