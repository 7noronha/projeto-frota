import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface VelocidadeMedia {
  motoristaId: number | null;
  veiculoId: number | null;
  velocidadeMediaKmH: number;
  amostras: number;
}

const FALLBACK_KM_H = 40;
const AMOSTRAS_MINIMAS = 3;

@Injectable()
export class VelocidadeService {
  constructor(private readonly prisma: PrismaService) {}

  private cache = new Map<string, { valor: VelocidadeMedia; expiradoEm: number }>();
  private readonly ttlMs = 5 * 60 * 1000;
  private statusFinalizadaId: number | null = null;

  private async getStatusFinalizadaId(): Promise<number> {
    if (this.statusFinalizadaId != null) return this.statusFinalizadaId;
    const s = await this.prisma.status_viagem.findUnique({ where: { nome: 'FINALIZADA' } });
    if (!s) throw new Error('Status FINALIZADA não cadastrado');
    this.statusFinalizadaId = s.id;
    return s.id;
  }

  async porMotorista(motoristaId: number): Promise<VelocidadeMedia> {
    const chave = `motorista:${motoristaId}`;
    const cached = this.cache.get(chave);
    if (cached && cached.expiradoEm > Date.now()) return cached.valor;

    const statusFinId = await this.getStatusFinalizadaId();

    const viagens = await this.prisma.viagens.findMany({
      where: {
        motorista_id: motoristaId,
        status_id: statusFinId,
        data_hora_exclusao: null,
        data_hora_inicio_real: { not: null },
        data_hora_fim_real: { not: null },
        distancia_percorrida: { not: null },
      },
      select: {
        distancia_percorrida: true,
        data_hora_inicio_real: true,
        data_hora_fim_real: true,
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

  async global(): Promise<VelocidadeMedia> {
    const chave = 'global';
    const cached = this.cache.get(chave);
    if (cached && cached.expiradoEm > Date.now()) return cached.valor;

    const statusFinId = await this.getStatusFinalizadaId();

    const viagens = await this.prisma.viagens.findMany({
      where: {
        status_id: statusFinId,
        data_hora_exclusao: null,
        data_hora_inicio_real: { not: null },
        data_hora_fim_real: { not: null },
        distancia_percorrida: { not: null },
      },
      select: {
        distancia_percorrida: true,
        data_hora_inicio_real: true,
        data_hora_fim_real: true,
      },
      take: 200,
      orderBy: { data_hora_fim_real: 'desc' },
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

  invalidar(motoristaId?: number): void {
    if (motoristaId) this.cache.delete(`motorista:${motoristaId}`);
    this.cache.delete('global');
  }

  private calcular(
    viagens: Array<{
      distancia_percorrida: number | null;
      data_hora_inicio_real: Date | null;
      data_hora_fim_real: Date | null;
    }>,
  ): number {
    const validas = viagens.filter(
      (v) => v.distancia_percorrida && v.data_hora_inicio_real && v.data_hora_fim_real,
    );
    if (validas.length < AMOSTRAS_MINIMAS) return FALLBACK_KM_H;

    let totalKm = 0;
    let totalHoras = 0;
    for (const v of validas) {
      const horas =
        (v.data_hora_fim_real!.getTime() - v.data_hora_inicio_real!.getTime()) / (1000 * 60 * 60);
      if (horas <= 0 || horas > 24) continue;
      totalKm += v.distancia_percorrida!;
      totalHoras += horas;
    }

    if (totalHoras <= 0) return FALLBACK_KM_H;
    const kmH = totalKm / totalHoras;
    return Math.max(10, Math.min(120, kmH));
  }
}
