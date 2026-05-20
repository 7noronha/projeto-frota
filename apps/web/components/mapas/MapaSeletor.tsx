'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useCallback, useMemo, useState } from 'react';
import Map, { Marker, NavigationControl, type MapRef } from 'react-map-gl';
import type { MapLayerMouseEvent } from 'mapbox-gl';
import { AddressAutofill } from '@mapbox/search-js-react';

export interface Ponto {
  latitude: number;
  longitude: number;
}

interface MapaSeletorProps {
  origem?: Ponto | null;
  destino?: Ponto | null;
  onChange?: (p: { origem: Ponto | null; destino: Ponto | null }) => void;
  altura?: number;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
// Centro default: Brasília (centro geográfico do país é próximo)
const CENTRO_DEFAULT = { latitude: -15.7942, longitude: -47.8822, zoom: 4 };

/**
 * Seletor de origem e destino no mapa.
 * - Toggle entre "marcando origem" / "marcando destino".
 * - Clique no mapa define o ponto do modo ativo.
 * - Campo de busca por endereço (Mapbox geocoding) preenche o ponto ativo.
 * - Marcadores visuais: verde (origem) e azul-marinho (destino).
 */
export function MapaSeletor({
  origem = null,
  destino = null,
  onChange,
  altura = 400,
}: MapaSeletorProps) {
  const [modo, setModo] = useState<'origem' | 'destino'>('origem');
  const [endereco, setEndereco] = useState('');
  const [mapaRef, setMapaRef] = useState<MapRef | null>(null);

  const centro = useMemo(() => {
    if (origem) return { latitude: origem.latitude, longitude: origem.longitude, zoom: 13 };
    if (destino) return { latitude: destino.latitude, longitude: destino.longitude, zoom: 13 };
    return CENTRO_DEFAULT;
  }, [origem, destino]);

  const atualizarPonto = useCallback(
    (ponto: Ponto) => {
      if (modo === 'origem') {
        onChange?.({ origem: ponto, destino });
      } else {
        onChange?.({ origem, destino: ponto });
      }
    },
    [modo, origem, destino, onChange],
  );

  const aoClicarMapa = useCallback(
    (e: MapLayerMouseEvent) => {
      atualizarPonto({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
    },
    [atualizarPonto],
  );

  const aoSelecionarEndereco = useCallback(
    (resultado: { features: Array<{ geometry: { coordinates: number[] }; properties?: { full_address?: string } }> }) => {
      const feat = resultado.features[0];
      if (!feat) return;
      const lng = feat.geometry.coordinates[0];
      const lat = feat.geometry.coordinates[1];
      if (lng == null || lat == null) return;
      atualizarPonto({ latitude: lat, longitude: lng });
      setEndereco(feat.properties?.full_address ?? '');
      mapaRef?.flyTo({ center: [lng, lat], zoom: 14 });
    },
    [atualizarPonto, mapaRef],
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div
        style={{
          height: altura,
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: 8,
          padding: 16,
          color: '#92400e',
        }}
      >
        <strong>NEXT_PUBLIC_MAPBOX_TOKEN não configurada.</strong> Configure o token do Mapbox
        nas variáveis de ambiente (Vercel + local) para habilitar a seleção no mapa.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setModo('origem')}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: `1px solid ${modo === 'origem' ? '#16a34a' : '#cbd5e1'}`,
            background: modo === 'origem' ? '#16a34a' : '#ffffff',
            color: modo === 'origem' ? '#ffffff' : '#334155',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Marcar origem
        </button>
        <button
          type="button"
          onClick={() => setModo('destino')}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: `1px solid ${modo === 'destino' ? '#0066FF' : '#cbd5e1'}`,
            background: modo === 'destino' ? '#0066FF' : '#ffffff',
            color: modo === 'destino' ? '#ffffff' : '#334155',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Marcar destino
        </button>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Clique no mapa ou busque um endereço para marcar o ponto ativo.
        </span>
      </div>

      <AddressAutofill accessToken={MAPBOX_TOKEN} onRetrieve={aoSelecionarEndereco}>
        <input
          type="text"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          placeholder="Buscar endereço…"
          autoComplete="street-address"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            fontSize: 14,
          }}
        />
      </AddressAutofill>

      <div style={{ height: altura, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <Map
          ref={(r) => setMapaRef(r)}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={centro}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onClick={aoClicarMapa}
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

      <div style={{ fontSize: 12, color: '#475569' }}>
        {origem ? (
          <>
            <strong style={{ color: '#16a34a' }}>Origem:</strong> {origem.latitude.toFixed(6)},{' '}
            {origem.longitude.toFixed(6)}
          </>
        ) : (
          <span style={{ color: '#94a3b8' }}>Origem não marcada</span>
        )}
        {' · '}
        {destino ? (
          <>
            <strong style={{ color: '#0066FF' }}>Destino:</strong> {destino.latitude.toFixed(6)},{' '}
            {destino.longitude.toFixed(6)}
          </>
        ) : (
          <span style={{ color: '#94a3b8' }}>Destino não marcado</span>
        )}
      </div>
    </div>
  );
}
