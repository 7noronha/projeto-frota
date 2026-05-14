import Link from 'next/link';
import { Badge, HStack, VStack, Text, Icon } from '@lojascem/components-react';
import { EstadoVazio } from '@/components/EstadoVazio';
import type { Alerta, SeveridadeAlerta } from '@/app/(dashboard)/alertas/actions';

interface ListaAlertasProps {
  alertas: Alerta[];
}

const CONFIG_SEVERIDADE: Record<
  SeveridadeAlerta,
  {
    rotulo: string;
    color: 'error' | 'warning' | 'info';
    borda: string;
    acento: string;
    fundo: string;
  }
> = {
  alto: {
    rotulo: 'Crítico',
    color: 'error',
    borda: '#FCA5A5',
    acento: '#DC2626',
    fundo: '#FEF2F2',
  },
  medio: {
    rotulo: 'Atenção',
    color: 'warning',
    borda: '#FCD34D',
    acento: '#D97706',
    fundo: '#FFFBEB',
  },
  baixo: {
    rotulo: 'Informativo',
    color: 'info',
    borda: '#BFDBFE',
    acento: '#2563EB',
    fundo: '#EFF6FF',
  },
};

type IconeAlerta =
  | 'PiIdentificationCardBold'
  | 'PiClockCountdownBold'
  | 'PiWarningCircleBold'
  | 'PiWarningOctagonBold'
  | 'PiWrenchBold'
  | 'PiShieldCheckBold';

const CONFIG_TIPO: Record<Alerta['tipo'], { icone: IconeAlerta }> = {
  cnh_vencida: { icone: 'PiIdentificationCardBold' },
  cnh_vencendo: { icone: 'PiIdentificationCardBold' },
  viagem_atrasada: { icone: 'PiClockCountdownBold' },
  viagem_sem_inicio: { icone: 'PiWarningCircleBold' },
  multa_vencida: { icone: 'PiWarningOctagonBold' },
  multa_vencendo: { icone: 'PiWarningOctagonBold' },
  manutencao_devida: { icone: 'PiWrenchBold' },
  seguro_vencido: { icone: 'PiShieldCheckBold' },
  seguro_vencendo: { icone: 'PiShieldCheckBold' },
};

export function ListaAlertas({ alertas }: ListaAlertasProps): React.ReactElement {
  if (alertas.length === 0) {
    return (
      <EstadoVazio
        icone="PiCheckCircleBold"
        titulo="Tudo em ordem"
        descricao="Nenhum alerta pendente no momento. CNHs em dia e viagens dentro do prazo."
      />
    );
  }

  return (
    <VStack className="gap-2">
      {alertas.map((a) => {
        const cfgSev = CONFIG_SEVERIDADE[a.severidade];
        const cfgTipo = CONFIG_TIPO[a.tipo];
        const conteudo = (
          <div
            className="block rounded-xl border p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            style={{
              background: cfgSev.fundo,
              borderColor: cfgSev.borda,
              borderLeft: `4px solid ${cfgSev.acento}`,
            }}
          >
            <HStack alignItems="center" className="gap-3">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  background: `${cfgSev.acento}20`,
                  color: cfgSev.acento,
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                }}
              >
                <Icon name={cfgTipo.icone} size="md" color="default" />
              </div>
              <VStack className="gap-0.5 flex-1">
                <HStack alignItems="center" className="gap-2 flex-wrap">
                  <Text size="sm" className="font-semibold" style={{ color: '#1e293b' }}>
                    {a.titulo}
                  </Text>
                  <Badge color={cfgSev.color} variant="light" size="sm">
                    {cfgSev.rotulo}
                  </Badge>
                </HStack>
                <Text size="xs" style={{ color: '#64748b' }}>
                  {a.descricao}
                </Text>
              </VStack>
              {a.href && <Icon name="PiArrowRightBold" size="sm" color="default" />}
            </HStack>
          </div>
        );

        return a.href ? (
          <Link key={a.id} href={a.href} style={{ textDecoration: 'none' }}>
            {conteudo}
          </Link>
        ) : (
          <div key={a.id}>{conteudo}</div>
        );
      })}
    </VStack>
  );
}
