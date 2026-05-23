import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, HStack, VStack, Heading, Text, Icon } from '@lojascem/components-react';
import { buscarViagens } from '../viagens/actions';
import { buscarCnhsVencendoEm30Dias } from './actions';
import { EstadoVazio } from '@/components/EstadoVazio';
import type { ViagemDetalhada } from '@fleetops/types';
import { agoraBrasilia } from '@fleetops/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Painel — FleetOps' };

interface AtrasoCalc {
  estaAtrasada: boolean;
  minutosAtraso: number;
}

function calcularAtraso(v: ViagemDetalhada): AtrasoCalc {
  if (v.status.nome !== 'EM_ANDAMENTO') return { estaAtrasada: false, minutosAtraso: 0 };
  // data_viagem (YYYY-MM-DD) + hora_fim_prevista (HH:MM)
  const fimPrevisto = new Date(`${v.data_viagem}T${v.hora_fim_prevista}:00-03:00`);
  const agora = agoraBrasilia();
  if (agora <= fimPrevisto) return { estaAtrasada: false, minutosAtraso: 0 };
  const minutos = Math.floor((agora.getTime() - fimPrevisto.getTime()) / 60_000);
  return { estaAtrasada: true, minutosAtraso: minutos };
}

function formatarAtraso(minutos: number): string {
  if (minutos < 60) return `${minutos} min atrasada`;
  const horas = Math.floor(minutos / 60);
  const restantes = minutos % 60;
  return restantes === 0
    ? `${horas}h atrasada`
    : `${horas}h ${restantes}min atrasada`;
}

export default async function PaginaDashboard(): Promise<React.ReactElement> {
  const [emAndamentoPag, criadasPag, cnhVencendo] = await Promise.all([
    buscarViagens(1, { status: 'EM_ANDAMENTO' }),
    buscarViagens(1, { status: 'CRIADA' }),
    buscarCnhsVencendoEm30Dias(),
  ]);

  const emAndamento = emAndamentoPag.dados;
  const totalEmAndamento = emAndamentoPag.total;
  const totalCriadas = criadasPag.total;

  // Calcula atrasos
  const atrasadas = emAndamento.filter((v) => calcularAtraso(v).estaAtrasada);
  const totalAtrasadas = atrasadas.length;

  return (
    <VStack className="gap-6">
      {/* Cabeçalho */}
      <HStack alignItems="center" justifyContent="between">
        <VStack>
          <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
            Painel
          </Heading>
          <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
            Visão geral das viagens em execução agora
          </Text>
        </VStack>
        <Link href="/viagens/nova" style={{ textDecoration: 'none' }}>
          <Button color="primary" leftIcon="PiPlusBold">
            Nova viagem
          </Button>
        </Link>
      </HStack>

      {/* Resumo numérico — 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardResumo
          rotulo="Em andamento"
          valor={totalEmAndamento}
          icone="PiPlayCircleBold"
          cor="#0066FF"
        />
        <CardResumo
          rotulo="Agendadas"
          valor={totalCriadas}
          icone="PiCalendarBlankBold"
          cor="#9333EA"
        />
        <CardResumo
          rotulo="Atrasadas"
          valor={totalAtrasadas}
          icone="PiClockCountdownBold"
          cor={totalAtrasadas > 0 ? '#DC2626' : '#94a3b8'}
          destaque={totalAtrasadas > 0}
        />
        <CardResumo
          rotulo="CNHs vencendo (30d)"
          valor={cnhVencendo.total}
          icone="PiIdentificationCardBold"
          cor={cnhVencendo.total > 0 ? '#D97706' : '#94a3b8'}
          destaque={cnhVencendo.total > 0}
        />
      </div>

      {/* Lista de viagens em andamento */}
      <VStack className="gap-3">
        <HStack alignItems="center" justifyContent="between">
          <Heading size="md" weight="semibold" style={{ color: 'var(--fo-navy)' }}>
            Viagens em andamento
          </Heading>
          {totalEmAndamento > 0 && (
            <Link
              href="/viagens?status=EM_ANDAMENTO"
              className="text-sm font-medium"
              style={{ color: '#0066FF', textDecoration: 'none' }}
            >
              Ver todas →
            </Link>
          )}
        </HStack>

        {emAndamento.length === 0 ? (
          <EstadoVazio
            icone="PiMapTrifoldBold"
            titulo="Nenhuma viagem em andamento"
            descricao="Quando uma viagem for iniciada, ela aparecerá aqui."
            cta={
              <Link href="/viagens" style={{ textDecoration: 'none' }}>
                <Button variant="outline" color="default" size="sm" leftIcon="PiListBold">
                  Ver agendadas
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {emAndamento.map((v) => {
              const atraso = calcularAtraso(v);
              return (
                <Link
                  key={v.id}
                  href={`/viagens/${v.id}`}
                  style={{ textDecoration: 'none' }}
                  className="block rounded-xl border bg-white p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <VStack className="gap-3">
                    <HStack alignItems="center" justifyContent="between">
                      {atraso.estaAtrasada ? (
                        <Badge color="error" variant="light" size="sm">
                          {formatarAtraso(atraso.minutosAtraso)}
                        </Badge>
                      ) : (
                        <Badge color="warning" variant="light" size="sm">
                          Em andamento
                        </Badge>
                      )}
                      <Icon name="PiArrowRightBold" size="sm" color="default" />
                    </HStack>

                    <VStack className="gap-1">
                      <Text size="xs" className="font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                        Destino
                      </Text>
                      <Text size="sm" className="font-medium" style={{ color: '#1e293b' }}>
                        {v.destino}
                      </Text>
                    </VStack>

                    <div className="grid grid-cols-2 gap-3 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                      <VStack className="gap-1">
                        <HStack alignItems="center" className="gap-1.5">
                          <Icon name="PiUserBold" size="xs" color="default" />
                          <Text size="xs" className="font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                            Motorista
                          </Text>
                        </HStack>
                        <Text size="sm" style={{ color: '#1e293b' }}>
                          {v.motorista.nome}
                        </Text>
                      </VStack>

                      <VStack className="gap-1">
                        <HStack alignItems="center" className="gap-1.5">
                          <Icon name="PiCarBold" size="xs" color="default" />
                          <Text size="xs" className="font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                            Veículo
                          </Text>
                        </HStack>
                        <Text size="sm" className="font-mono" style={{ color: '#1e293b' }}>
                          {v.veiculo.placa}
                        </Text>
                        <Text size="xs" style={{ color: '#64748b' }}>
                          {v.veiculo.marca} {v.veiculo.modelo}
                        </Text>
                      </VStack>
                    </div>
                  </VStack>
                </Link>
              );
            })}
          </div>
        )}
      </VStack>

      {/* Alerta de CNHs vencendo */}
      {cnhVencendo.total > 0 && (
        <VStack className="gap-3">
          <HStack alignItems="center" justifyContent="between">
            <HStack alignItems="center" className="gap-2">
              <Icon name="PiWarningBold" size="md" color="warning" />
              <Heading size="md" weight="semibold" style={{ color: 'var(--fo-navy)' }}>
                CNHs vencendo em até 30 dias
              </Heading>
            </HStack>
            <Link
              href="/motoristas"
              className="text-sm font-medium"
              style={{ color: '#0066FF', textDecoration: 'none' }}
            >
              Ver motoristas →
            </Link>
          </HStack>

          <div
            className="rounded-xl border p-4"
            style={{ borderColor: '#fbbf24', background: '#fffbeb' }}
          >
            <VStack className="gap-2">
              {cnhVencendo.proximos.map((m) => {
                const validade = m.cnh_validade ? new Date(m.cnh_validade + 'T00:00:00') : null;
                const hoje = agoraBrasilia();
                hoje.setHours(0, 0, 0, 0);
                const dias = validade
                  ? Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
                  : 0;
                const vencida = dias < 0;

                return (
                  <HStack
                    key={m.id}
                    alignItems="center"
                    justifyContent="between"
                    className="py-1"
                  >
                    <VStack className="gap-0">
                      <Text size="sm" className="font-medium" style={{ color: '#1e293b' }}>
                        {m.nome}
                      </Text>
                      <Text size="xs" style={{ color: '#64748b' }}>
                        Matrícula {m.matricula} · CNH {m.cnh}
                      </Text>
                    </VStack>
                    <Badge color={vencida ? 'error' : 'warning'} variant="light" size="sm">
                      {vencida
                        ? `Vencida há ${Math.abs(dias)}d`
                        : dias === 0
                          ? 'Vence hoje'
                          : `Vence em ${dias}d`}
                    </Badge>
                  </HStack>
                );
              })}

              {cnhVencendo.total > cnhVencendo.proximos.length && (
                <Text size="xs" className="pt-2" style={{ color: '#92400e' }}>
                  + {cnhVencendo.total - cnhVencendo.proximos.length} outros motoristas com CNH
                  vencendo em breve.
                </Text>
              )}
            </VStack>
          </div>
        </VStack>
      )}
    </VStack>
  );
}

interface CardResumoProps {
  rotulo: string;
  valor: number;
  icone:
    | 'PiPlayCircleBold'
    | 'PiCalendarBlankBold'
    | 'PiClockCountdownBold'
    | 'PiIdentificationCardBold';
  cor: string;
  destaque?: boolean;
}

function CardResumo({
  rotulo,
  valor,
  icone,
  cor,
  destaque = false,
}: CardResumoProps): React.ReactElement {
  return (
    <div
      className="rounded-xl border bg-white p-4"
      style={{
        borderColor: destaque ? cor : '#e2e8f0',
        boxShadow: destaque ? `inset 0 0 0 1px ${cor}` : undefined,
      }}
    >
      <HStack alignItems="center" className="gap-3">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ background: `${cor}15`, color: cor, width: 40, height: 40 }}
        >
          <Icon name={icone} size="md" color="primary" />
        </div>
        <VStack className="gap-0.5">
          <Text size="xs" className="font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
            {rotulo}
          </Text>
          <Text size="xl" className="font-bold" style={{ color: '#0f172a' }}>
            {valor}
          </Text>
        </VStack>
      </HStack>
    </div>
  );
}
