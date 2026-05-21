import { Injectable, Logger } from '@nestjs/common';

export interface RotaMapbox {
  /** GeoJSON LineString { type: 'LineString', coordinates: [[lng, lat], ...] } */
  geometria: unknown;
  /** Distância da rota em quilômetros (não linha reta) */
  distanciaKm: number;
  /** Duração estimada em minutos */
  duracaoMin: number;
}

interface DirectionsResponse {
  routes?: Array<{
    geometry?: { type: string; coordinates: number[][] };
    distance?: number;
    duration?: number;
  }>;
}

/**
 * Roteamento (origem → destino) via Mapbox Directions API. Devolve a
 * geometria da rota + distância real por estradas + duração estimada.
 *
 * Free tier: 100.000 requests/mês. Cacheamos no banco (na viagem) para
 * não fazer chamada por leitura.
 *
 * Tolerante a falha: retorna null se Mapbox não cobrir ou recusar.
 */
@Injectable()
export class DirectionsService {
  private readonly logger = new Logger(DirectionsService.name);
  private readonly token = process.env.MAPBOX_TOKEN ?? '';

  async rotear(origem: { latitude: number; longitude: number }, destino: { latitude: number; longitude: number }): Promise<RotaMapbox | null> {
    if (!this.token) return null;
    const coords = `${origem.longitude},${origem.latitude};${destino.longitude},${destino.latitude}`;
    const url =
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
      `?geometries=geojson&overview=full&language=pt&access_token=${this.token}`;

    try {
      const resposta = await fetch(url);
      if (!resposta.ok) {
        this.logger.warn(`Mapbox Directions respondeu ${resposta.status}`);
        return null;
      }
      const dados = (await resposta.json()) as DirectionsResponse;
      const rota = dados.routes?.[0];
      if (!rota?.geometry || rota.distance == null || rota.duration == null) {
        return null;
      }
      return {
        geometria: rota.geometry,
        distanciaKm: rota.distance / 1000,
        duracaoMin: rota.duration / 60,
      };
    } catch (erro) {
      this.logger.error(
        `Falha ao rotear via Mapbox: ${erro instanceof Error ? erro.message : 'erro desconhecido'}`,
      );
      return null;
    }
  }
}
