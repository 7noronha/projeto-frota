import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Badge,
  BadgeText,
  ScrollView,
} from '@gluestack-ui/themed';
import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { formatarDataIso } from '@fleetops/utils';
import { fetchApi } from '@/lib/api';
import { ListaViagensSkeleton } from '@/components/ListaViagensSkeleton';
import { BannerCnhVencendo } from '@/components/BannerCnhVencendo';
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
  const data = formatarDataIso(viagem.dataViagem);

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
  // router não é usado mais aqui (handleSair foi para o header)
  const [filtroStatus, setFiltroStatus] = useState<StatusViagem | undefined>();

  const params = new URLSearchParams({ tamanhoPagina: '50' });
  if (filtroStatus) params.set('status', filtroStatus);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['viagens', filtroStatus],
    queryFn: () => fetchApi<RespostaPaginada<ViagemDetalhada>>(`/viagens?${params}`),
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
      edges={['bottom', 'left', 'right']}
    >
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

      {/* Banner de CNH vencendo (se aplicável) */}
      <BannerCnhVencendo />

      {/* Lista */}
      {isLoading ? (
        <ListaViagensSkeleton quantidade={5} />
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
            <Box alignItems="center" justifyContent="center" py="$16" px="$6">
              {/* Decoração visual: círculo com sub-círculo dentro (sem lib de ícones) */}
              <Box
                width={72}
                height={72}
                borderRadius={36}
                backgroundColor="#E0F2FE"
                alignItems="center"
                justifyContent="center"
                mb="$4"
              >
                <Box width={32} height={32} borderRadius={16} backgroundColor="#0EA5E9" />
              </Box>
              <Text color="$textDark900" fontWeight="$semibold" size="md" textAlign="center" mb="$1">
                {filtroStatus
                  ? `Nenhuma viagem ${
                      filtroStatus === 'CRIADA'
                        ? 'agendada'
                        : filtroStatus === 'EM_ANDAMENTO'
                          ? 'em andamento'
                          : 'finalizada'
                    }`
                  : 'Você ainda não tem viagens'}
              </Text>
              <Text color="$textLight500" textAlign="center" size="sm">
                {filtroStatus
                  ? 'Troque o filtro para ver outras viagens.'
                  : 'Quando um operador agendar uma viagem para você, ela aparecerá aqui.'}
              </Text>
              {filtroStatus && (
                <Pressable
                  onPress={() => setFiltroStatus(undefined)}
                  mt="$5"
                  sx={{
                    backgroundColor: '#0066FF',
                    borderRadius: '$lg',
                    px: '$5',
                    py: '$3',
                    ':active': { opacity: 0.85 },
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Mostrar todas as viagens"
                >
                  <Text color="$white" fontWeight="$semibold" size="sm">
                    Mostrar todas
                  </Text>
                </Pressable>
              )}
            </Box>
          ) : (
            <VStack pb="$8">
              {data?.dados.map((v) => <CartaoViagem key={v.id} viagem={v} />)}
            </VStack>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
