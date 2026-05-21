'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, Marker, NavigationControl, Source, type MapRef } from 'react-map-gl';
import type { Feature, LineString } from 'geojson';

interface MapaViagemProps {
  origemLatitude: number | null;
  origemLongitude: number | null;
  destinoLatitude: number | null;
  destinoLongitude: number | null;
  altura?: number;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

interface DirectionsResponse {
  routes?: Array<{
    geometry: LineString;
    distance?: number;
    duration?: number;
  }>;
}

/**
 * Visualização do mapa da viagem com origem (verde), destino (azul) e a
 * rota real por estradas (Mapbox Directions API). Auto-enquadra para
 * mostrar a rota inteira.
 *
 * A rota é buscada uma vez por par origem/destino. Se a Directions API
 * recusar (token expirado, sem cobertura), o mapa cai para uma linha
 * reta tracejada — assim o trajeto sempre aparece de algum jeito.
 */
export function MapaViagem({
  origemLatitude,
  origemLongitude,
  destinoLatitude,
  destinoLongitude,
  altura = 350,
}: MapaViagemProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [rota, setRota] = useState<Feature<LineString> | null>(null);

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

  // Busca a rota real pela Mapbox Directions sempre que origem/destino mudam
  useEffect(() => {
    if (!origem || !destino || !MAPBOX_TOKEN) {
      setRota(null);
      return;
    }
    let cancelado = false;
    const coords = `${origem.longitude},${origem.latitude};${destino.longitude},${destino.latitude}`;
    const url =
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
      `?geometries=geojson&overview=full&language=pt&access_token=${MAPBOX_TOKEN}`;

    fetch(url)
      .then((r) => (r.ok ? (r.json() as Promise<DirectionsResponse>) : null))
      .then((dados) => {
        if (cancelado) return;
        const geometry = dados?.routes?.[0]?.geometry;
        if (geometry) {
          setRota({ type: 'Feature', properties: {}, geometry });
        } else {
          // Fallback: linha reta entre os dois pontos
          setRota({
            type: 'Feature',
            properties: { fallback: true },
            geometry: {
              type: 'LineString',
              coordinates: [
                [origem.longitude, origem.latitude],
                [destino.longitude, destino.latitude],
              ],
            },
          });
        }
      })
      .catch(() => {
        if (cancelado) return;
        setRota({
          type: 'Feature',
          properties: { fallback: true },
          geometry: {
            type: 'LineString',
            coordinates: [
              [origem.longitude, origem.latitude],
              [destino.longitude, destino.latitude],
            ],
          },
        });
      });

    return () => {
      cancelado = true;
    };
  }, [origem, destino]);

  // Auto-enquadra o mapa para mostrar a rota toda (origem + destino + traçado)
  useEffect(() => {
    if (!mapRef.current || !rota) return;
    const coords = rota.geometry.coordinates;
    if (coords.length < 2) return;
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;
    for (const [lng, lat] of coords) {
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }
    mapRef.current.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 50, duration: 800, maxZoom: 14 },
    );
  }, [rota]);

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

  const rotaEhFallback = rota?.properties?.fallback === true;

  return (
    <div style={{ height: altura, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <Map
        ref={(r) => {
          mapRef.current = r;
        }}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={centro!}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        {rota && (
          <Source id="rota-viagem" type="geojson" data={rota}>
            {/* Halo branco por baixo (legibilidade) */}
            <Layer
              id="rota-halo"
              type="line"
              paint={{
                'line-color': '#ffffff',
                'line-width': 7,
                'line-opacity': 0.9,
              }}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            />
            {/* Linha principal azul */}
            <Layer
              id="rota-linha"
              type="line"
              paint={{
                'line-color': '#0066FF',
                'line-width': 4,
                'line-opacity': 0.9,
                ...(rotaEhFallback && { 'line-dasharray': [2, 2] }),
              }}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            />
          </Source>
        )}

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
