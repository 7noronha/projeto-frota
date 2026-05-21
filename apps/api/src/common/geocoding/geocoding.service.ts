import { Injectable, Logger } from '@nestjs/common';

export interface CoordenadasGeocode {
  latitude: number;
  longitude: number;
}

/**
 * Serviço de geocoding (texto → coordenadas) usando a API pública do
 * Nominatim/OpenStreetMap.
 *
 * Sem token. A política do Nominatim exige User-Agent identificável e
 * limite de 1 req/seg — o limite é respeitado por uma fila interna que
 * serializa requisições. Para volumes maiores que o MVP, considerar
 * provider pago (LocationIQ, OpenCage, Mapbox) ou hospedar Nominatim.
 *
 * Tolerante a falha: se a API recusar ou estiver fora, retorna null —
 * a viagem é criada sem coordenadas e o mapa simplesmente não é exibido.
 * Não bloqueia o fluxo principal.
 */
@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly cache = new Map<string, CoordenadasGeocode | null>();

  /**
   * Serializa requisições em fila — Nominatim exige ≤ 1 req/segundo.
   * Promise encadeada com setTimeout entre cada chamada.
   */
  private filaPromise: Promise<void> = Promise.resolve();
  private readonly intervaloMinMs = 1100;

  private readonly endpoint = 'https://nominatim.openstreetmap.org/search';
  // Identifica a aplicação conforme exigido pela política de uso do Nominatim.
  // Em produção real, substituir o e-mail pelo do operador da instância.
  private readonly userAgent = 'FleetOps/1.0 (https://github.com/7noronha/projeto-frota)';

  async geocodificar(endereco: string): Promise<CoordenadasGeocode | null> {
    const chave = endereco.trim().toLowerCase();
    if (!chave) return null;
    if (this.cache.has(chave)) return this.cache.get(chave) ?? null;

    // Aguarda a vez na fila (rate limit do Nominatim)
    const minhaVez = this.filaPromise.then(() => this.requisitar(endereco));
    this.filaPromise = minhaVez.then(
      () => new Promise((resolve) => setTimeout(resolve, this.intervaloMinMs)),
    );

    const resultado = await minhaVez;
    this.cache.set(chave, resultado);
    return resultado;
  }

  private async requisitar(endereco: string): Promise<CoordenadasGeocode | null> {
    const url = new URL(this.endpoint);
    url.searchParams.set('q', endereco);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'br');
    url.searchParams.set('addressdetails', '0');
    url.searchParams.set('accept-language', 'pt-BR');

    try {
      const resposta = await fetch(url.toString(), {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'pt-BR',
        },
      });
      if (!resposta.ok) {
        this.logger.warn(`Nominatim respondeu ${resposta.status} para "${endereco}"`);
        return null;
      }
      const dados = (await resposta.json()) as Array<{ lat?: string; lon?: string }>;
      const primeiro = dados[0];
      if (!primeiro?.lat || !primeiro?.lon) return null;

      const latitude = Number(primeiro.lat);
      const longitude = Number(primeiro.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
      return { latitude, longitude };
    } catch (erro) {
      this.logger.error(
        `Falha ao geocodar "${endereco}" via Nominatim: ${
          erro instanceof Error ? erro.message : 'erro desconhecido'
        }`,
      );
      return null;
    }
  }
}
