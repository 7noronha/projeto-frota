import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { buscarToken } from '@/lib/auth';

export default function LayoutMotorista() {
  const router = useRouter();

  useEffect(() => {
    buscarToken().then((token) => {
      if (!token) router.replace('/login');
    });
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0A2540' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Minhas Viagens' }} />
      <Stack.Screen name="viagens/[id]" options={{ title: 'Detalhe da Viagem' }} />
    </Stack>
  );
}
