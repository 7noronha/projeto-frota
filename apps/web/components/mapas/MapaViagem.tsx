'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';

interface MapaViagemProps {
  origemLatitude: number | null;
  origemLongitude: number | null;
  destinoLatitude: number | null;
  destinoLongitude: number | null;
  altura?: number;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

/**
 * Visualização read-only do mapa da viagem com origem (verde) e destino (azul).
 * Auto-enquadra para mostrar ambos os pontos. Não renderiza se nenhuma das
 * duas coordenadas estiver disponível. Sem o token configurado, mostra um
 * placeholder amigável em vez de quebrar a tela.
 */
export function MapaViagem({
  origemLatitude,
  origemLongitude,
  destinoLatitude,
  destinoLongitude,
  altura = 350,
}: MapaViagemProps) {
  const origem = useMemo(
    () =>
      origemLatitude != null && origemLongitude != null
        ? { latitude: origemLatitude, longitude: origemLongitude }
        : null,
    [origemLatitude, origemLongitude],
  );
  const destino = useMemo(
    () =>
      destinoLatitude != null && destinoLongitude != null
        ? { latitude: destinoLatitude, longitude: destinoLongitude }
        : null,
    [destinoLatitude, destinoLongitude],
  );

  const centro = useMemo(() => {
    if (origem && destino) {
      return {
        latitude: (origem.latitude + destino.latitude) / 2,
        longitude: (origem.longitude + destino.longitude) / 2,
        zoom: 9,
      };
    }
    if (origem) return { latitude: origem.latitude, longitude: origem.longitude, zoom: 13 };
    if (destino) return { latitude: destino.latitude, longitude: destino.longitude, zoom: 13 };
    return null;
  }, [origem, destino]);

  if (!origem && !destino) return null;

  if (!MAPBOX_TOKEN) {
    return (
      <div
        style={{
          padding: 12,
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: 8,
          color: '#92400e',
          fontSize: 13,
        }}
      >
        Mapa indisponível — variável <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> não configurada.
      </div>
    );
  }

  return (
    <div style={{ height: altura, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={centro!}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        {origem ? (
          <Marker latitude={origem.latitude} longitude={origem.longitude} color="#16a34a" />
        ) : null}
        {destino ? (
          <Marker latitude={destino.latitude} longitude={destino.longitude} color="#0066FF" />
        ) : null}
      </Map>
    </div>
  );
}
