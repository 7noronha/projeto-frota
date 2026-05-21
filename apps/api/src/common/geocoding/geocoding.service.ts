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
 *
 * Limite gratuito: 100.000 buscas/mês (free tier do Mapbox). Mais que
 * suficiente para o MVP.
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

    // Mapbox limita queries a 20 tokens (palavras). Se o endereço passar
    // disso, tenta primeiro com a versão completa e, se receber 422, cai
    // pra uma versão limpa (remove parênteses, S/Nº, expressões longas).
    const candidatos = [endereco, ...this.gerarCandidatosSimplificados(endereco)];

    for (const candidato of candidatos) {
      const coords = await this.tentar(candidato);
      if (coords) {
        this.cache.set(chave, coords);
        return coords;
      }
    }

    this.cache.set(chave, null);
    return null;
  }

  /**
   * Gera versões progressivamente mais limpas do endereço para tentar
   * quando o Mapbox recusa por "Query too long" (422) ou sem resultados.
   *
   * Remove ruído típico de endereços brasileiros descritivos:
   *  - parênteses e seu conteúdo
   *  - "S/Nº", "S/N", "SN"
   *  - "na região do/da", "em" antes de cidade
   *  - vírgulas duplicadas
   */
  private gerarCandidatosSimplificados(endereco: string): string[] {
    const limpo = endereco
      .replace(/\([^)]*\)/g, '')
      .replace(/\bs\/n[º°o]?\b/gi, '')
      .replace(/\bna regi[aã]o (do|da)\b/gi, '')
      .replace(/,\s*,/g, ',')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+,/g, ',')
      .trim();
    if (limpo && limpo !== endereco) return [limpo];
    return [];
  }

  private async tentar(endereco: string): Promise<CoordenadasGeocode | null> {
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endereco)}.json` +
      `?access_token=${this.token}&country=BR&limit=1&language=pt`;

    try {
      const resposta = await fetch(url);
      if (!resposta.ok) {
        this.logger.warn(`Mapbox respondeu ${resposta.status} para "${endereco}"`);
        return null;
      }
      const dados = (await resposta.json()) as {
        features?: Array<{ center?: [number, number] }>;
      };
      const center = dados.features?.[0]?.center;
      if (!center || center.length < 2) return null;
      const [longitude, latitude] = center;
      return { latitude, longitude };
    } catch (erro) {
      this.logger.error(
        `Falha ao geocodar "${endereco}": ${erro instanceof Error ? erro.message : 'erro desconhecido'}`,
      );
      return null;
    }
  }
}
