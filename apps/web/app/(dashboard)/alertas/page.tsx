import type { Metadata } from 'next';
import { VStack, HStack, Heading, Text, Badge } from '@lojascem/components-react';
import { ListaAlertas } from '@/components/alertas/ListaAlertas';
import { buscarAlertas } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Alertas — FleetOps' };

export default async function PaginaAlertas(): Promise<React.ReactElement> {
  const alertas = await buscarAlertas();

  const totalCriticos = alertas.filter((a) => a.severidade === 'alto').length;
  const totalAtencao = alertas.filter((a) => a.severidade === 'medio').length;

  return (
    <VStack className="gap-6 mx-auto" style={{ maxWidth: 900 }}>
      <HStack alignItems="center" justifyContent="between">
        <VStack>
          <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
            Alertas
          </Heading>
          <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
            {alertas.length === 0
              ? 'Nenhum alerta no momento'
              : `${alertas.length} ${alertas.length === 1 ? 'alerta' : 'alertas'} pendentes`}
          </Text>
        </VStack>
        {alertas.length > 0 && (
          <HStack alignItems="center" className="gap-2">
            {totalCriticos > 0 && (
              <Badge color="error" variant="light">
                {totalCriticos} {totalCriticos === 1 ? 'crítico' : 'críticos'}
              </Badge>
            )}
            {totalAtencao > 0 && (
              <Badge color="warning" variant="light">
                {totalAtencao} atenção
              </Badge>
            )}
          </HStack>
        )}
      </HStack>

      <ListaAlertas alertas={alertas} />
    </VStack>
  );
}
