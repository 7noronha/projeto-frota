'use client';

import { Card, HStack, Text, Icon } from '@lojascem/components-react';
import { distanciaKm, formatarDistancia, type PontoGeo } from '@fleetops/utils';

interface InfoDistanciaViagemProps {
  origemLatitude: number | null;
  origemLongitude: number | null;
  destinoLatitude: number | null;
  destinoLongitude: number | null;
  /** Em km. Quando informado, exibimos lado a lado com a linha reta. */
  distanciaPercorrida?: number | null;
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
  origemLatitude,
  origemLongitude,
  destinoLatitude,
  destinoLongitude,
  distanciaPercorrida,
}: InfoDistanciaViagemProps) {
  const origem = asPonto(origemLatitude, origemLongitude);
  const destino = asPonto(destinoLatitude, destinoLongitude);
  const linhaRetaKm = origem && destino ? distanciaKm(origem, destino) : null;
  const semCoords = !origem || !destino;

  return (
    <Card>
      <Card.Content>
        <HStack alignItems="center" className="gap-6">
          <div style={{ flex: 1 }}>
            <Text size="xs" className="font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
              Distância até o destino
            </Text>
            {linhaRetaKm != null ? (
              <>
                <Text size="lg" className="mt-1 font-bold" style={{ color: '#0A2540' }}>
                  {formatarDistancia(linhaRetaKm)}
                </Text>
                <Text size="xs" style={{ color: '#94a3b8' }}>
                  em linha reta, entre origem e destino
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

          {distanciaPercorrida != null && (
            <>
              <div style={{ width: 1, height: 56, background: '#e2e8f0' }} />
              <div style={{ flex: 1 }}>
                <Text size="xs" className="font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                  Distância percorrida
                </Text>
                <Text size="lg" className="mt-1 font-bold" style={{ color: '#0A2540' }}>
                  {distanciaPercorrida.toLocaleString('pt-BR')} km
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
