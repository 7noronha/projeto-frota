'use client';

import { Card, HStack, Text, Icon } from '@lojascem/components-react';
import { distanciaKm, formatarDistancia, formatarTempo, type PontoGeo } from '@fleetops/utils';

interface InfoDistanciaViagemProps {
  origem_latitude: number | null;
  origem_longitude: number | null;
  destino_latitude: number | null;
  destino_longitude: number | null;
  /** Em km. Quando informado, exibimos lado a lado com a linha reta. */
  distancia_percorrida?: number | null;
  /** Distância real por estradas (Mapbox Directions). Quando presente,
   * substitui a linha reta como métrica primária. */
  rota_distancia_km?: number | null;
  /** Duração estimada da rota em minutos (Mapbox Directions). */
  rota_duracao_min?: number | null;
}

function asPonto(lat: number | null, lng: number | null): PontoGeo | null {
  return lat != null && lng != null ? { latitude: lat, longitude: lng } : null;
}

/**
 * Card com a distância em linha reta entre origem e destino. Sempre que a
 * viagem tem as duas coordenadas, esse card aparece — não depende de status
 * nem de GPS. Se já existir distância percorrida (viagem FINALIZADA), mostra
 * ambas pra comparação ("linha reta" vs "rodada").
 */
export function InfoDistanciaViagem({
  origem_latitude,
  origem_longitude,
  destino_latitude,
  destino_longitude,
  distancia_percorrida,
  rota_distancia_km,
  rota_duracao_min,
}: InfoDistanciaViagemProps) {
  const origem = asPonto(origem_latitude, origem_longitude);
  const destino = asPonto(destino_latitude, destino_longitude);
  const linhaRetaKm = origem && destino ? distanciaKm(origem, destino) : null;
  const semCoords = !origem || !destino;
  // Preferimos a distância da rota Mapbox (real) sobre a linha reta quando
  // disponível. Linha reta vira fallback.
  const distanciaPrincipal = rota_distancia_km ?? linhaRetaKm;
  const usandoRotaReal = rota_distancia_km != null;

  return (
    <Card>
      <Card.Content>
        <HStack alignItems="center" className="gap-6">
          <div style={{ flex: 1 }}>
            <Text size="xs" className="font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
              Distância até o destino
            </Text>
            {distanciaPrincipal != null ? (
              <>
                <Text size="lg" className="mt-1 font-bold" style={{ color: '#0A2540' }}>
                  {formatarDistancia(distanciaPrincipal)}
                </Text>
                <Text size="xs" style={{ color: '#94a3b8' }}>
                  {usandoRotaReal ? 'por estrada (rota Mapbox)' : 'em linha reta'}
                </Text>
              </>
            ) : (
              <HStack alignItems="center" className="gap-2 mt-1">
                <Icon name="PiInfoBold" size="sm" color="warning" />
                <Text size="sm" style={{ color: '#92400e' }}>
                  Aguardando geocodificação do endereço.
                </Text>
              </HStack>
            )}
          </div>

          {rota_duracao_min != null && (
            <>
              <div style={{ width: 1, height: 56, background: '#e2e8f0' }} />
              <div style={{ flex: 1 }}>
                <Text size="xs" className="font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                  Tempo estimado
                </Text>
                <Text size="lg" className="mt-1 font-bold" style={{ color: '#0A2540' }}>
                  {formatarTempo(rota_duracao_min)}
                </Text>
                <Text size="xs" style={{ color: '#94a3b8' }}>
                  rota direta (sem trânsito)
                </Text>
              </div>
            </>
          )}

          {distancia_percorrida != null && (
            <>
              <div style={{ width: 1, height: 56, background: '#e2e8f0' }} />
              <div style={{ flex: 1 }}>
                <Text size="xs" className="font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                  Distância percorrida
                </Text>
                <Text size="lg" className="mt-1 font-bold" style={{ color: '#0A2540' }}>
                  {distancia_percorrida.toLocaleString('pt-BR')} km
                </Text>
                <Text size="xs" style={{ color: '#94a3b8' }}>
                  registro do odômetro
                </Text>
              </div>
            </>
          )}
        </HStack>

        {semCoords && (
          <Text size="xs" className="mt-3" style={{ color: '#94a3b8' }}>
            Os endereços ainda não foram convertidos em coordenadas. Verifique
            se o serviço Mapbox está configurado no servidor (variável
            <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, margin: '0 2px' }}>
              MAPBOX_TOKEN
            </code>
            ).
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}
