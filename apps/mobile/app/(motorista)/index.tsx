import { useCallback, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Spinner,
  Badge,
  BadgeText,
  Divider,
  ScrollView,
} from '@gluestack-ui/themed';
import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { removerToken } from '@/lib/auth';
import type { RespostaPaginada, ViagemDetalhada, StatusViagem } from '@fleetops/types';

const CONFIG_STATUS: Record<StatusViagem, { rotulo: string; cor: string; fundo: string }> = {
  CRIADA: { rotulo: 'Criada', cor: '#1D4ED8', fundo: '#DBEAFE' },
  EM_ANDAMENTO: { rotulo: 'Em andamento', cor: '#92400E', fundo: '#FEF3C7' },
  FINALIZADA: { rotulo: 'Finalizada', cor: '#065F46', fundo: '#D1FAE5' },
};

function BadgeStatus({ status }: { status: StatusViagem }) {
  const cfg = CONFIG_STATUS[status];
  return (
    <Badge
      sx={{ backgroundColor: cfg.fundo }}
      borderRadius="$full"
      px="$3"
      py="$1"
    >
      <BadgeText sx={{ color: cfg.cor }} size="xs" fontWeight="$semibold">
        {cfg.rotulo}
      </BadgeText>
    </Badge>
  );
}

function CartaoViagem({ viagem }: { viagem: ViagemDetalhada }) {
  const router = useRouter();
  const data = new Date(viagem.dataViagem + 'T00:00:00').toLocaleDateString('pt-BR');

  return (
    <Pressable
      onPress={() => router.push(`/(motorista)/viagens/${viagem.id}`)}
      sx={{ ':active': { opacity: 0.7 } }}
    >
      <Box
        backgroundColor="$white"
        borderRadius="$xl"
        p="$4"
        mb="$3"
        borderWidth={1}
        borderColor="$borderLight200"
        shadowColor="$black"
        shadowOffset={{ width: 0, height: 1 }}
        shadowOpacity={0.05}
        shadowRadius={2}
      >
        <HStack justifyContent="space-between" alignItems="flex-start" mb="$2">
          <Text fontWeight="$semibold" color="$textDark900" flex={1} mr="$2" numberOfLines={1}>
            {viagem.destino}
          </Text>
          <BadgeStatus status={viagem.status} />
        </HStack>

        <HStack space="md" mt="$1">
          <Text size="sm" color="$textLight500">
            {data}
          </Text>
          <Text size="sm" color="$textLight500">
            {viagem.horaInicioPrevista} – {viagem.horaFimPrevista}
          </Text>
        </HStack>

        {viagem.distanciaPercorrida != null && (
          <Text size="sm" color="$textLight500" mt="$1">
            {viagem.distanciaPercorrida.toLocaleString('pt-BR')} km percorridos
          </Text>
        )}
      </Box>
    </Pressable>
  );
}

const FILTROS_STATUS = [
  { valor: undefined, rotulo: 'Todas' },
  { valor: 'CRIADA' as StatusViagem, rotulo: 'Criadas' },
  { valor: 'EM_ANDAMENTO' as StatusViagem, rotulo: 'Em andamento' },
  { valor: 'FINALIZADA' as StatusViagem, rotulo: 'Finalizadas' },
];

export default function TelaViagens() {
  const router = useRouter();
  const [filtroStatus, setFiltroStatus] = useState<StatusViagem | undefined>();

  const params = new URLSearchParams({ tamanhoPagina: '50' });
  if (filtroStatus) params.set('status', filtroStatus);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['viagens', filtroStatus],
    queryFn: () => fetchApi<RespostaPaginada<ViagemDetalhada>>(`/viagens?${params}`),
  });

  const handleSair = useCallback(async () => {
    await removerToken();
    router.replace('/login');
  }, [router]);

  return (
    <Box flex={1} backgroundColor="#F8FAFC">
      {/* Filtros de status */}
      <Box backgroundColor="$white" borderBottomWidth={1} borderBottomColor="$borderLight200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} px="$4" py="$3">
          <HStack space="sm">
            {FILTROS_STATUS.map((f) => {
              const ativo = filtroStatus === f.valor;
              return (
                <Pressable
                  key={f.rotulo}
                  onPress={() => setFiltroStatus(f.valor)}
                  sx={{
                    backgroundColor: ativo ? '#0066FF' : '$white',
                    borderWidth: 1,
                    borderColor: ativo ? '#0066FF' : '$borderLight200',
                    borderRadius: '$full',
                    px: '$4',
                    py: '$2',
                    ':active': { opacity: 0.8 },
                  }}
                >
                  <Text
                    size="sm"
                    fontWeight="$medium"
                    color={ativo ? '$white' : '$textLight700'}
                  >
                    {f.rotulo}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </ScrollView>
      </Box>

      {/* Lista */}
      {isLoading ? (
        <Box flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="#0066FF" />
        </Box>
      ) : isError ? (
        <Box flex={1} alignItems="center" justifyContent="center" px="$6">
          <Text color="$error600" textAlign="center" mb="$4">
            Não foi possível carregar as viagens.
          </Text>
          <Pressable onPress={() => refetch()}>
            <Text color="#0066FF" fontWeight="$semibold">
              Tentar novamente
            </Text>
          </Pressable>
        </Box>
      ) : (
        <ScrollView
          px="$4"
          pt="$4"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#0066FF" />
          }
        >
          {data?.dados.length === 0 ? (
            <Box alignItems="center" justifyContent="center" py="$16">
              <Text color="$textLight400" textAlign="center">
                Nenhuma viagem encontrada.
              </Text>
            </Box>
          ) : (
            <VStack>
              {data?.dados.map((v) => <CartaoViagem key={v.id} viagem={v} />)}
            </VStack>
          )}

          {/* Botão sair no rodapé */}
          <Divider mt="$4" mb="$3" />
          <Pressable onPress={handleSair} mb="$8" alignItems="center">
            <Text color="$textLight400" size="sm">
              Sair da conta
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </Box>
  );
}
