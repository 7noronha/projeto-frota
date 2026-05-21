'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useMemo } from 'react';
import { Map, Marker, NavigationControl, type MapProps } from 'react-map-gl/maplibre';

interface MapaViagemProps {
  origemLatitude: number | null;
  origemLongitude: number | null;
  destinoLatitude: number | null;
  destinoLongitude: number | null;
  altura?: number;
}

/**
 * Estilo MapLibre minimalista usando tiles do OpenStreetMap.
 *
 * Vantagens: sem token, sem dependência de provedor pago. Em produção
 * com tráfego alto, considerar self-hosting dos tiles (operating an
 * OSM tile server) ou trocar para um provider pago (MapTiler, Stadia
 * Maps) — só substituir a URL aqui.
 */
// Tipado via MapProps['mapStyle'] para evitar conflito entre as duas cópias do
// pacote @maplibre/maplibre-gl-style-spec instaladas no node_modules.
const ESTILO_OSM: MapProps['mapStyle'] = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

/**
 * Visualização read-only do mapa da viagem com origem (verde) e destino
 * (azul). Auto-enquadra para mostrar ambos os pontos. Não renderiza se
 * nenhuma das duas coordenadas estiver disponível.
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

  return (
    <div style={{ height: altura, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <Map
        initialViewState={centro!}
        mapStyle={ESTILO_OSM}
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
