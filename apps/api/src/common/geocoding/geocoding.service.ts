import { Injectable, Logger } from '@nestjs/common';

export interface CoordenadasGeocode {
  latitude: number;
  longitude: number;
}

/**
 * Serviço de geocoding (texto → coordenadas) usando a Mapbox Geocoding API.
 *
 * Resolve endereços para lat/lng no servidor, no momento de criar/atualizar
 * a viagem. As coordenadas persistidas viram cache: o detalhe da viagem e
 * o app mobile leem direto do banco, sem geocodar novamente.
 *
 * Tolerante a falha: se o token não estiver configurado ou a API recusar,
 * retorna `null` — a viagem é criada sem coordenadas e o mapa simplesmente
 * não é exibido. Não bloqueia o fluxo principal de criação.
 */
@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly token = process.env.MAPBOX_TOKEN ?? '';
  private readonly cache = new Map<string, CoordenadasGeocode | null>();

  async geocodificar(endereco: string): Promise<CoordenadasGeocode | null> {
    const chave = endereco.trim().toLowerCase();
    if (!chave) return null;
    if (this.cache.has(chave)) return this.cache.get(chave) ?? null;

    if (!this.token) {
      this.logger.warn('MAPBOX_TOKEN não configurada — geocoding desabilitado.');
      // Não cacheia: se o token aparecer depois, tentamos de novo
      return null;
    }

    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endereco)}.json` +
      `?access_token=${this.token}&country=BR&limit=1&language=pt`;

    try {
      const resposta = await fetch(url);
      if (!resposta.ok) {
        this.logger.warn(`Mapbox respondeu ${resposta.status} para "${endereco}"`);
        this.cache.set(chave, null);
        return null;
      }
      const dados = (await resposta.json()) as {
        features?: Array<{ center?: [number, number] }>;
      };
      const center = dados.features?.[0]?.center;
      if (!center || center.length < 2) {
        this.cache.set(chave, null);
        return null;
      }
      const [longitude, latitude] = center;
      const coords: CoordenadasGeocode = { latitude, longitude };
      this.cache.set(chave, coords);
      return coords;
    } catch (erro) {
      this.logger.error(
        `Falha ao geocodar "${endereco}": ${erro instanceof Error ? erro.message : 'erro desconhecido'}`,
      );
      this.cache.set(chave, null);
      return null;
    }
  }
}
