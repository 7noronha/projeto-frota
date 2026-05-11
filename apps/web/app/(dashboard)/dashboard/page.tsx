import Link from 'next/link';
import { Badge, Button, HStack, VStack, Heading, Text, Icon } from '@lojascem/components-react';
import { buscarViagens } from '../viagens/actions';
import { EstadoVazio } from '@/components/EstadoVazio';

export const dynamic = 'force-dynamic';

export default async function PaginaDashboard(): Promise<React.ReactElement> {
  // Busca todas as viagens em andamento (status = EM_ANDAMENTO)
  const { dados: emAndamento, total: totalEmAndamento } = await buscarViagens(1, {
    status: 'EM_ANDAMENTO',
  });
  const { total: totalCriadas } = await buscarViagens(1, { status: 'CRIADA' });

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

      {/* Resumo numérico */}
      <div className="grid grid-cols-2 gap-4" style={{ maxWidth: 520 }}>
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
            {emAndamento.map((v) => (
              <Link
                key={v.id}
                href={`/viagens/${v.id}`}
                style={{ textDecoration: 'none' }}
                className="block rounded-xl border bg-white p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <VStack className="gap-3">
                  <HStack alignItems="center" justifyContent="between">
                    <Badge color="warning" variant="light" size="sm">
                      Em andamento
                    </Badge>
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
            ))}
          </div>
        )}
      </VStack>
    </VStack>
  );
}

interface CardResumoProps {
  rotulo: string;
  valor: number;
  icone: 'PiPlayCircleBold' | 'PiCalendarBlankBold';
  cor: string;
}

function CardResumo({ rotulo, valor, icone, cor }: CardResumoProps): React.ReactElement {
  return (
    <div
      className="rounded-xl border bg-white p-4"
      style={{ borderColor: '#e2e8f0' }}
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
