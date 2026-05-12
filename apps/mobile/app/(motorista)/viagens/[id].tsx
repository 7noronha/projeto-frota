import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  InputField,
  Button,
  ButtonText,
  ButtonSpinner,
  Badge,
  BadgeText,
  Divider,
  ScrollView,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from '@gluestack-ui/themed';
import { RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi, ErroApi } from '@/lib/api';
import { useNotificar } from '@/lib/notificar';
import { DetalheViagemSkeleton } from '@/components/DetalheViagemSkeleton';
import type { ViagemDetalhada, StatusViagem } from '@fleetops/types';

const CONFIG_STATUS: Record<StatusViagem, { rotulo: string; cor: string; fundo: string }> = {
  CRIADA: { rotulo: 'Criada', cor: '#1D4ED8', fundo: '#DBEAFE' },
  EM_ANDAMENTO: { rotulo: 'Em andamento', cor: '#92400E', fundo: '#FEF3C7' },
  FINALIZADA: { rotulo: 'Finalizada', cor: '#065F46', fundo: '#D1FAE5' },
};

function CampoInfo({ rotulo, valor }: { rotulo: string; valor?: string | number | null }) {
  return (
    <Box>
      <Text size="xs" color="$textLight400" textTransform="uppercase" letterSpacing="$lg">
        {rotulo}
      </Text>
      <Text size="sm" color="$textDark900" fontWeight="$medium" mt="$0.5">
        {valor ?? '—'}
      </Text>
    </Box>
  );
}

function SecaoCard({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Box
      backgroundColor="$white"
      borderRadius="$xl"
      p="$4"
      borderWidth={1}
      borderColor="$borderLight200"
    >
      <Text size="sm" fontWeight="$semibold" color="$textLight500" mb="$3" textTransform="uppercase">
        {titulo}
      </Text>
      {children}
    </Box>
  );
}

function FormIniciar({ id, odometroAtual }: { id: string; odometroAtual: number }) {
  const [odometro, setOdometro] = useState(String(odometroAtual));
  const [erro, setErro] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const notificar = useNotificar();

  const mutacao = useMutation({
    mutationFn: (odometroInicial: number) =>
      fetchApi(`/viagens/${id}/iniciar`, {
        method: 'PATCH',
        body: JSON.stringify({ odometroInicial }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagem', id] });
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      notificar.sucesso({
        titulo: 'Viagem iniciada',
        descricao: 'Boa viagem! Lembre-se de finalizar ao chegar.',
      });
    },
    onError: (e) => {
      const msg = e instanceof ErroApi ? e.message : 'Erro ao iniciar viagem';
      setErro(msg);
      notificar.erro({ titulo: 'Não foi possível iniciar', descricao: msg });
    },
  });

  function handleIniciar() {
    const valor = parseInt(odometro, 10);
    if (isNaN(valor) || valor < odometroAtual) {
      setErro(`Odômetro deve ser ≥ ${odometroAtual.toLocaleString('pt-BR')} km`);
      return;
    }
    setErro(null);
    mutacao.mutate(valor);
  }

  return (
    <Box
      backgroundColor="#EFF6FF"
      borderRadius="$xl"
      p="$4"
      borderWidth={1}
      borderColor="#BFDBFE"
    >
      <Text fontWeight="$semibold" color="#1E40AF" mb="$3">
        Iniciar viagem
      </Text>
      <FormControl isInvalid={!!erro} mb="$3">
        <FormControlLabel>
          <FormControlLabelText size="sm" color="$textDark700">
            Odômetro inicial (km)
          </FormControlLabelText>
        </FormControlLabel>
        <Input variant="outline" backgroundColor="$white">
          <InputField
            keyboardType="numeric"
            value={odometro}
            onChangeText={(v) => { setOdometro(v); setErro(null); }}
            placeholder={String(odometroAtual)}
          />
        </Input>
        <Text size="xs" color="$textLight400" mt="$1">
          Odômetro atual do veículo: {odometroAtual.toLocaleString('pt-BR')} km
        </Text>
        {erro && (
          <FormControlError>
            <FormControlErrorText>{erro}</FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>
      <Button
        onPress={handleIniciar}
        isDisabled={mutacao.isPending}
        backgroundColor="#0066FF"
        borderRadius="$lg"
      >
        {mutacao.isPending ? (
          <ButtonSpinner color="$white" />
        ) : (
          <ButtonText color="$white" fontWeight="$semibold">
            Confirmar início
          </ButtonText>
        )}
      </Button>
    </Box>
  );
}

function FormFinalizar({ id, odometroInicial }: { id: string; odometroInicial: number }) {
  const [odometro, setOdometro] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const notificar = useNotificar();

  const mutacao = useMutation({
    mutationFn: (odometroFinal: number) =>
      fetchApi(`/viagens/${id}/finalizar`, {
        method: 'PATCH',
        body: JSON.stringify({ odometroFinal }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagem', id] });
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      notificar.sucesso({
        titulo: 'Viagem finalizada',
        descricao: 'Obrigado! Os dados foram registrados.',
      });
    },
    onError: (e) => {
      const msg = e instanceof ErroApi ? e.message : 'Erro ao finalizar viagem';
      setErro(msg);
      notificar.erro({ titulo: 'Não foi possível finalizar', descricao: msg });
    },
  });

  function handleFinalizar() {
    const valor = parseInt(odometro, 10);
    if (isNaN(valor) || valor <= odometroInicial) {
      setErro(`Odômetro deve ser > ${odometroInicial.toLocaleString('pt-BR')} km`);
      return;
    }
    setErro(null);
    mutacao.mutate(valor);
  }

  return (
    <Box
      backgroundColor="#FFFBEB"
      borderRadius="$xl"
      p="$4"
      borderWidth={1}
      borderColor="#FDE68A"
    >
      <Text fontWeight="$semibold" color="#92400E" mb="$3">
        Finalizar viagem
      </Text>
      <FormControl isInvalid={!!erro} mb="$3">
        <FormControlLabel>
          <FormControlLabelText size="sm" color="$textDark700">
            Odômetro final (km)
          </FormControlLabelText>
        </FormControlLabel>
        <Input variant="outline" backgroundColor="$white">
          <InputField
            keyboardType="numeric"
            value={odometro}
            onChangeText={(v) => { setOdometro(v); setErro(null); }}
            placeholder={String(odometroInicial + 1)}
          />
        </Input>
        <Text size="xs" color="$textLight400" mt="$1">
          Odômetro na saída: {odometroInicial.toLocaleString('pt-BR')} km
        </Text>
        {erro && (
          <FormControlError>
            <FormControlErrorText>{erro}</FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>
      <Button
        onPress={handleFinalizar}
        isDisabled={mutacao.isPending}
        backgroundColor="#059669"
        borderRadius="$lg"
      >
        {mutacao.isPending ? (
          <ButtonSpinner color="$white" />
        ) : (
          <ButtonText color="$white" fontWeight="$semibold">
            Confirmar chegada
          </ButtonText>
        )}
      </Button>
    </Box>
  );
}

export default function TelaDetalheViagem() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: viagem, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['viagem', id],
    queryFn: () => fetchApi<ViagemDetalhada>(`/viagens/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <ScrollView flex={1} backgroundColor="#F8FAFC">
        <DetalheViagemSkeleton />
      </ScrollView>
    );
  }

  if (isError || !viagem) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center" px="$6" backgroundColor="#F8FAFC">
        <Text color="$error600" textAlign="center" mb="$4">
          Não foi possível carregar a viagem.
        </Text>
        <Button onPress={() => refetch()} variant="outline" borderColor="#0066FF">
          <ButtonText color="#0066FF">Tentar novamente</ButtonText>
        </Button>
      </Box>
    );
  }

  const cfg = CONFIG_STATUS[viagem.status];
  const dataViagem = new Date(viagem.dataViagem + 'T00:00:00').toLocaleDateString('pt-BR');

  return (
    <ScrollView
      flex={1}
      backgroundColor="#F8FAFC"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#0066FF" />
      }
    >
      <VStack space="md" px="$4" py="$4">
        {/* Status */}
        <HStack justifyContent="flex-end">
          <Badge sx={{ backgroundColor: cfg.fundo }} borderRadius="$full" px="$3" py="$1">
            <BadgeText sx={{ color: cfg.cor }} size="sm" fontWeight="$semibold">
              {cfg.rotulo}
            </BadgeText>
          </Badge>
        </HStack>

        {/* Destino principal */}
        <Box>
          <Heading size="xl" color="$textDark900" numberOfLines={2}>
            {viagem.destino}
          </Heading>
          <Text color="$textLight400" mt="$1">
            {dataViagem} · {viagem.horaInicioPrevista} – {viagem.horaFimPrevista}
          </Text>
        </Box>

        <Divider />

        {/* Informações gerais */}
        <SecaoCard titulo="Detalhes">
          <VStack space="md">
            <HStack space="lg">
              <Box flex={1}>
                <CampoInfo rotulo="Data" valor={dataViagem} />
              </Box>
              <Box flex={1}>
                <CampoInfo
                  rotulo="Horário previsto"
                  valor={`${viagem.horaInicioPrevista} – ${viagem.horaFimPrevista}`}
                />
              </Box>
            </HStack>
            <CampoInfo rotulo="Origem" valor={viagem.origem} />
            <CampoInfo rotulo="Solicitado por" valor={viagem.solicitadoPor} />
            <CampoInfo rotulo="Autorizado por" valor={viagem.autorizadoPor} />
            {viagem.observacoes && (
              <CampoInfo rotulo="Observações" valor={viagem.observacoes} />
            )}
          </VStack>
        </SecaoCard>

        {/* Veículo */}
        <SecaoCard titulo="Veículo">
          <HStack space="lg">
            <Box flex={1}>
              <CampoInfo rotulo="Placa" valor={viagem.veiculo.placa} />
            </Box>
            <Box flex={1}>
              <CampoInfo
                rotulo="Modelo"
                valor={`${viagem.veiculo.marca} ${viagem.veiculo.modelo}`}
              />
            </Box>
          </HStack>
        </SecaoCard>

        {/* Execução (quando iniciada) */}
        {viagem.status !== 'CRIADA' && (
          <SecaoCard titulo="Execução">
            <VStack space="md">
              <HStack space="lg">
                <Box flex={1}>
                  <CampoInfo
                    rotulo="Início real"
                    valor={
                      viagem.dataHoraInicioReal
                        ? new Date(viagem.dataHoraInicioReal).toLocaleString('pt-BR')
                        : undefined
                    }
                  />
                </Box>
                <Box flex={1}>
                  <CampoInfo
                    rotulo="Fim real"
                    valor={
                      viagem.dataHoraFimReal
                        ? new Date(viagem.dataHoraFimReal).toLocaleString('pt-BR')
                        : undefined
                    }
                  />
                </Box>
              </HStack>
              <HStack space="lg">
                <Box flex={1}>
                  <CampoInfo
                    rotulo="Odôm. inicial"
                    valor={
                      viagem.odometroInicial != null
                        ? `${viagem.odometroInicial.toLocaleString('pt-BR')} km`
                        : undefined
                    }
                  />
                </Box>
                <Box flex={1}>
                  <CampoInfo
                    rotulo="Odôm. final"
                    valor={
                      viagem.odometroFinal != null
                        ? `${viagem.odometroFinal.toLocaleString('pt-BR')} km`
                        : undefined
                    }
                  />
                </Box>
              </HStack>
              {viagem.distanciaPercorrida != null && (
                <CampoInfo
                  rotulo="Distância percorrida"
                  valor={`${viagem.distanciaPercorrida.toLocaleString('pt-BR')} km`}
                />
              )}
            </VStack>
          </SecaoCard>
        )}

        {/* Ação contextual */}
        {viagem.status === 'CRIADA' && (
          <FormIniciar id={viagem.id} odometroAtual={viagem.veiculo.odometroAtual} />
        )}

        {viagem.status === 'EM_ANDAMENTO' && viagem.odometroInicial != null && (
          <FormFinalizar id={viagem.id} odometroInicial={viagem.odometroInicial} />
        )}
      </VStack>
    </ScrollView>
  );
}
