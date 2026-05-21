import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface VelocidadeMedia {
  motoristaId: string | null;
  veiculoId: string | null;
  /** km/h calculado a partir de viagens FINALIZADAS */
  velocidadeMediaKmH: number;
  /** Número de viagens consideradas no cálculo */
  amostras: number;
}

const FALLBACK_KM_H = 40;
const AMOSTRAS_MINIMAS = 3;

/**
 * Calibra a velocidade média a partir do histórico real de viagens
 * FINALIZADAS. Usado pra substituir o 40 km/h fixo do mobile por uma
 * estimativa de chegada baseada na performance real do motorista/veículo.
 *
 * Critério: viagem precisa ter distanciaPercorrida + dataHoraInicioReal +
 * dataHoraFimReal definidos. Mínimo de 3 amostras pra evitar média ruidosa.
 *
 * Cache em memória de 5 min — recálculo é barato (algumas linhas), mas
 * fica caro fazer em toda request.
 */
@Injectable()
export class VelocidadeService {
  constructor(private readonly prisma: PrismaService) {}

  private cache = new Map<string, { valor: VelocidadeMedia; expiradoEm: number }>();
  private readonly ttlMs = 5 * 60 * 1000;

  /**
   * Velocidade média do motorista — média das suas viagens FINALIZADAS.
   * Se não tiver amostras suficientes, devolve fallback (40 km/h).
   */
  async porMotorista(motoristaId: string): Promise<VelocidadeMedia> {
    const chave = `motorista:${motoristaId}`;
    const cached = this.cache.get(chave);
    if (cached && cached.expiradoEm > Date.now()) return cached.valor;

    const viagens = await this.prisma.viagem.findMany({
      where: {
        motoristaId,
        status: 'FINALIZADA',
        dataExclusao: null,
        dataHoraInicioReal: { not: null },
        dataHoraFimReal: { not: null },
        distanciaPercorrida: { not: null },
      },
      select: {
        distanciaPercorrida: true,
        dataHoraInicioReal: true,
        dataHoraFimReal: true,
      },
    });

    const resultado: VelocidadeMedia = {
      motoristaId,
      veiculoId: null,
      velocidadeMediaKmH: this.calcular(viagens),
      amostras: viagens.length,
    };

    this.cache.set(chave, { valor: resultado, expiradoEm: Date.now() + this.ttlMs });
    return resultado;
  }

  /**
   * Velocidade média global da frota — fallback quando o motorista não tem
   * histórico suficiente. Útil pra novos motoristas.
   */
  async global(): Promise<VelocidadeMedia> {
    const chave = 'global';
    const cached = this.cache.get(chave);
    if (cached && cached.expiradoEm > Date.now()) return cached.valor;

    const viagens = await this.prisma.viagem.findMany({
      where: {
        status: 'FINALIZADA',
        dataExclusao: null,
        dataHoraInicioReal: { not: null },
        dataHoraFimReal: { not: null },
        distanciaPercorrida: { not: null },
      },
      select: {
        distanciaPercorrida: true,
        dataHoraInicioReal: true,
        dataHoraFimReal: true,
      },
      take: 200, // basta uma amostra recente
      orderBy: { dataHoraFimReal: 'desc' },
    });

    const resultado: VelocidadeMedia = {
      motoristaId: null,
      veiculoId: null,
      velocidadeMediaKmH: this.calcular(viagens),
      amostras: viagens.length,
    };

    this.cache.set(chave, { valor: resultado, expiradoEm: Date.now() + this.ttlMs });
    return resultado;
  }

  /**
   * Invalida o cache (chamar quando uma viagem é finalizada — vai
   * influenciar futuros cálculos).
   */
  invalidar(motoristaId?: string): void {
    if (motoristaId) this.cache.delete(`motorista:${motoristaId}`);
    this.cache.delete('global');
  }

  private calcular(
    viagens: Array<{
      distanciaPercorrida: number | null;
      dataHoraInicioReal: Date | null;
      dataHoraFimReal: Date | null;
    }>,
  ): number {
    const validas = viagens.filter(
      (v) => v.distanciaPercorrida && v.dataHoraInicioReal && v.dataHoraFimReal,
    );
    if (validas.length < AMOSTRAS_MINIMAS) return FALLBACK_KM_H;

    let totalKm = 0;
    let totalHoras = 0;
    for (const v of validas) {
      const horas =
        (v.dataHoraFimReal!.getTime() - v.dataHoraInicioReal!.getTime()) / (1000 * 60 * 60);
      if (horas <= 0 || horas > 24) continue; // protege contra timestamps esquisitos
      totalKm += v.distanciaPercorrida!;
      totalHoras += horas;
    }

    if (totalHoras <= 0) return FALLBACK_KM_H;
    const kmH = totalKm / totalHoras;
    // Sanidade: trava entre 10 e 120 km/h pra evitar valores absurdos
    return Math.max(10, Math.min(120, kmH));
  }
}
