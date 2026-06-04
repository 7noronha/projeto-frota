'use client';

import Link from 'next/link';
import { Badge, Button, Card, HStack, VStack, Heading, Text } from '@lojascem/components-react';
import { FormIniciarViagem } from '@/components/viagens/FormIniciarViagem';
import { FormFinalizarViagem } from '@/components/viagens/FormFinalizarViagem';
import type { ViagemDetalhada } from '@fleetops/types';
import { formatarDataIso, formatarDataHoraIso } from '@fleetops/utils';
import { MapaViagem } from '@/components/mapas/MapaViagem';
import { InfoDistanciaViagem } from '@/components/viagens/InfoDistanciaViagem';
import { usePosicaoMotorista } from '@/lib/usePosicaoMotorista';

type BadgeColor = 'info' | 'warning' | 'success' | 'default';

const ROTULOS_STATUS: Record<string, { texto: string; color: BadgeColor }> = {
  CRIADA: { texto: 'Criada', color: 'info' },
  EM_ANDAMENTO: { texto: 'Em andamento', color: 'warning' },
  FINALIZADA: { texto: 'Finalizada', color: 'success' },
};

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface DetalheViagemProps {
  viagem: ViagemDetalhada;
  acaoIniciar: AcaoFormulario;
  acaoFinalizar: AcaoFormulario;
}

/**
 * Quanto tempo passou desde um timestamp ISO/Brasília. "há 30s", "há 2 min",
 * "há 1h". Aceita strings no formato dd/MM/yyyy HH:mm:ss da API.
 */
function tempoDesde(timestamp: string | null | undefined): string {
  if (!timestamp) return 'há poucos instantes';
  const agora = Date.now();
  // formato Brasília "dd/MM/yyyy HH:mm:ss" precisa ser convertido
  const m = timestamp.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  const ms = m
    ? new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:${m[6]}-03:00`).getTime()
    : new Date(timestamp).getTime();
  if (!Number.isFinite(ms)) return 'há poucos instantes';
  const seg = Math.max(Math.round((agora - ms) / 1000), 0);
  if (seg < 60) return `há ${seg}s`;
  const min = Math.floor(seg / 60);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  const m2 = min % 60;
  return m2 === 0 ? `há ${h}h` : `há ${h}h ${m2}min`;
}

function CampoDetalhe({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
        {rotulo}
      </dt>
      <dd className="mt-1 text-sm" style={{ color: '#1e293b' }}>
        {valor ?? '—'}
      </dd>
    </div>
  );
}

export function DetalheViagem({ viagem, acaoIniciar, acaoFinalizar }: DetalheViagemProps) {
  const rotulo = ROTULOS_STATUS[viagem.status.nome] ?? { texto: viagem.status.nome, color: 'default' as BadgeColor };
  const data_viagem = formatarDataIso(viagem.data_viagem);

  // Rastreamento em tempo real: só polla enquanto viagem está em andamento
  const posicaoMotorista = usePosicaoMotorista({
    viagemId: viagem.id,
    ativo: viagem.status.nome === 'EM_ANDAMENTO',
  });

  return (
    <VStack className="gap-6 mx-auto max-w-3xl">
      {/* Cabeçalho */}
      <HStack alignItems="center" justifyContent="between">
        <VStack>
          <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
            Detalhe da viagem
          </Heading>
          <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
            ID: {viagem.id}
          </Text>
        </VStack>
        <HStack alignItems="center" className="gap-3">
          <Badge color={rotulo.color} variant="light" size="lg">{rotulo.texto}</Badge>
          {viagem.status.nome === 'CRIADA' && (
            <Link href={`/viagens/${viagem.id}/editar`} style={{ textDecoration: 'none' }}>
              <Button variant="outline" color="primary" size="sm" leftIcon="PiPencilBold">
                Editar
              </Button>
            </Link>
          )}
          <Link href="/viagens" style={{ textDecoration: 'none' }}>
            <Button variant="outline" color="default" size="sm" leftIcon="PiArrowLeftBold">
              Voltar
            </Button>
          </Link>
        </HStack>
      </HStack>

      {/* Informações gerais */}
      <Card>
        <Card.Header className="font-semibold text-base text-slate-800">
          Informações gerais
        </Card.Header>
        <Card.Content>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <CampoDetalhe rotulo="Destino" valor={viagem.destino} />
            <CampoDetalhe rotulo="Data da viagem" valor={data_viagem} />
            <CampoDetalhe rotulo="Hora início prevista" valor={viagem.hora_inicio_prevista} />
            <CampoDetalhe rotulo="Hora fim prevista" valor={viagem.hora_fim_prevista} />
            <CampoDetalhe rotulo="Solicitado por" valor={viagem.solicitado_por} />
            <CampoDetalhe rotulo="Autorizado por" valor={viagem.autorizado_por} />
            {viagem.observacoes && (
              <div className="col-span-2">
                <CampoDetalhe rotulo="Observações" valor={viagem.observacoes} />
              </div>
            )}
          </dl>
        </Card.Content>
      </Card>

      {/* Distância em linha reta (sempre que houver coords) */}
      <InfoDistanciaViagem
        origem_latitude={viagem.origem_latitude}
        origem_longitude={viagem.origem_longitude}
        destino_latitude={viagem.destino_latitude}
        destino_longitude={viagem.destino_longitude}
        distancia_percorrida={viagem.distancia_percorrida}
        rota_distancia_km={viagem.rota_distancia_km}
        rota_duracao_min={viagem.rota_duracao_min}
      />

      {/* Mapa — origem, destino + posição do motorista em tempo real */}
      {(viagem.origem_latitude != null || viagem.destino_latitude != null) && (
        <Card>
          <Card.Header className="font-semibold text-base text-slate-800">
            <HStack alignItems="center" justifyContent="between" className="w-full gap-3 flex-wrap">
              <span>Origem e destino no mapa</span>
              {viagem.status.nome === 'EM_ANDAMENTO' && (
                <Text
                  size="xs"
                  className="whitespace-nowrap"
                  style={{ color: posicaoMotorista ? '#f97316' : '#94a3b8' }}
                >
                  {posicaoMotorista
                    ? `Motorista visto ${tempoDesde(posicaoMotorista.capturadoEm)}`
                    : 'Aguardando posição do motorista…'}
                </Text>
              )}
            </HStack>
          </Card.Header>
          <Card.Content>
            <MapaViagem
              origem_latitude={viagem.origem_latitude}
              origem_longitude={viagem.origem_longitude}
              destino_latitude={viagem.destino_latitude}
              destino_longitude={viagem.destino_longitude}
              rota_geometria={viagem.rota_geometria}
              motoristaLatitude={posicaoMotorista?.latitude}
              motoristaLongitude={posicaoMotorista?.longitude}
            />
          </Card.Content>
        </Card>
      )}

      {/* Motorista e Veículo */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <Card.Header className="font-semibold text-base text-slate-800">Motorista</Card.Header>
          <Card.Content>
            <dl className="flex flex-col gap-3">
              <CampoDetalhe rotulo="Nome" valor={viagem.motorista.nome} />
              <CampoDetalhe rotulo="Matrícula" valor={viagem.motorista.matricula} />
            </dl>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header className="font-semibold text-base text-slate-800">Veículo</Card.Header>
          <Card.Content>
            <dl className="flex flex-col gap-3">
              <CampoDetalhe rotulo="Placa" valor={<span className="font-mono">{viagem.veiculo.placa}</span>} />
              <CampoDetalhe rotulo="Modelo" valor={`${viagem.veiculo.marca} ${viagem.veiculo.modelo}`} />
            </dl>
          </Card.Content>
        </Card>
      </div>

      {/* Execução */}
      {viagem.status.nome !== 'CRIADA' && (
        <Card>
          <Card.Header className="font-semibold text-base text-slate-800">Execução</Card.Header>
          <Card.Content>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <CampoDetalhe
                rotulo="Início real"
                valor={viagem.data_hora_inicio_real ? formatarDataHoraIso(viagem.data_hora_inicio_real) : null}
              />
              <CampoDetalhe
                rotulo="Fim real"
                valor={viagem.data_hora_fim_real ? formatarDataHoraIso(viagem.data_hora_fim_real) : null}
              />
              <CampoDetalhe
                rotulo="Odômetro inicial"
                valor={viagem.odometro_inicial != null ? `${viagem.odometro_inicial.toLocaleString('pt-BR')} km` : null}
              />
              <CampoDetalhe
                rotulo="Odômetro final"
                valor={viagem.odometro_final != null ? `${viagem.odometro_final.toLocaleString('pt-BR')} km` : null}
              />
              {viagem.distancia_percorrida != null && (
                <div className="col-span-2">
                  <CampoDetalhe
                    rotulo="Distância percorrida"
                    valor={`${viagem.distancia_percorrida.toLocaleString('pt-BR')} km`}
                  />
                </div>
              )}
            </dl>
          </Card.Content>
        </Card>
      )}

      {/* Ação: Iniciar */}
      {viagem.status.nome === 'CRIADA' && (
        <Card style={{ borderColor: '#bfdbfe', background: '#eff6ff' }}>
          <Card.Header className="font-semibold text-base text-blue-800">
            Iniciar viagem
          </Card.Header>
          <Card.Content>
            <FormIniciarViagem
              acao={acaoIniciar}
              odometroAtualVeiculo={viagem.veiculo.odometro_atual}
            />
          </Card.Content>
        </Card>
      )}

      {/* Ação: Finalizar */}
      {viagem.status.nome === 'EM_ANDAMENTO' && viagem.odometro_inicial != null && (
        <Card style={{ borderColor: '#fde68a', background: '#fffbeb' }}>
          <Card.Header className="font-semibold text-base text-amber-900">
            Finalizar viagem
          </Card.Header>
          <Card.Content>
            <FormFinalizarViagem acao={acaoFinalizar} odometro_inicial={viagem.odometro_inicial} />
          </Card.Content>
        </Card>
      )}
    </VStack>
  );
}
