import { useEffect } from 'react';
import { Spinner, Box } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { buscarToken } from '@/lib/auth';

export default function TelaInicial() {
  const router = useRouter();

  useEffect(() => {
    buscarToken().then((token) => {
      if (token) {
        router.replace('/(motorista)');
      } else {
        router.replace('/login');
      }
    });
  }, [router]);

  return (
    <Box flex={1} alignItems="center" justifyContent="center" backgroundColor="#0A2540">
      <Spinner size="large" color="#00C2FF" />
    </Box>
  );
}
