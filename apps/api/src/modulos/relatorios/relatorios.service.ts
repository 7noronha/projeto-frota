import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FiltrosPeriodoDto } from './dto/filtros-periodo.dto';
import {
  AgregadoMotoristaDto,
  AgregadoVeiculoDto,
} from './dto/agregado-resposta.dto';

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  private statusFinalizadaIdCache: number | null = null;

  private async statusFinalizadaId(): Promise<number> {
    if (this.statusFinalizadaIdCache !== null) return this.statusFinalizadaIdCache;
    const s = await this.prisma.status_viagem.findUnique({ where: { nome: 'FINALIZADA' } });
    if (!s) throw new Error('status_viagem "FINALIZADA" não encontrado');
    this.statusFinalizadaIdCache = s.id;
    return s.id;
  }

  private filtroPeriodo(filtros: FiltrosPeriodoDto) {
    const condicoes: Record<string, unknown> = {};
    if (filtros.dataInicio) condicoes.gte = new Date(filtros.dataInicio);
    if (filtros.dataFim) condicoes.lte = new Date(filtros.dataFim);
    return Object.keys(condicoes).length > 0 ? condicoes : undefined;
  }

  async distanciaPorMotorista(
    filtros: FiltrosPeriodoDto,
  ): Promise<AgregadoMotoristaDto[]> {
    const periodo = this.filtroPeriodo(filtros);
    const statusId = await this.statusFinalizadaId();
    const viagens = await this.prisma.viagens.findMany({
      where: {
        status_id: statusId,
        data_hora_exclusao: null,
        distancia_percorrida: { not: null },
        ...(periodo && { data_viagem: periodo }),
      },
      select: {
        motorista_id: true,
        distancia_percorrida: true,
        motorista: { select: { nome: true, matricula: true } },
      },
    });

    const mapa = new Map<number, AgregadoMotoristaDto>();
    for (const v of viagens) {
      const existente = mapa.get(v.motorista_id);
      if (existente) {
        existente.total_viagens += 1;
        existente.total_km += v.distancia_percorrida ?? 0;
      } else {
        mapa.set(v.motorista_id, {
          motorista_id: v.motorista_id,
          nome: v.motorista.nome,
          matricula: v.motorista.matricula,
          total_viagens: 1,
          total_km: v.distancia_percorrida ?? 0,
        });
      }
    }

    return [...mapa.values()].sort((a, b) => b.total_km - a.total_km);
  }

  async distanciaPorVeiculo(
    filtros: FiltrosPeriodoDto,
  ): Promise<AgregadoVeiculoDto[]> {
    const periodo = this.filtroPeriodo(filtros);
    const statusId = await this.statusFinalizadaId();
    const viagens = await this.prisma.viagens.findMany({
      where: {
        status_id: statusId,
        data_hora_exclusao: null,
        distancia_percorrida: { not: null },
        ...(periodo && { data_viagem: periodo }),
      },
      select: {
        veiculo_id: true,
        distancia_percorrida: true,
        veiculo: { select: { placa: true, marca: true, modelo: true } },
      },
    });

    const mapa = new Map<number, AgregadoVeiculoDto>();
    for (const v of viagens) {
      const existente = mapa.get(v.veiculo_id);
      if (existente) {
        existente.total_viagens += 1;
        existente.total_km += v.distancia_percorrida ?? 0;
      } else {
        mapa.set(v.veiculo_id, {
          veiculo_id: v.veiculo_id,
          placa: v.veiculo.placa,
          marca: v.veiculo.marca,
          modelo: v.veiculo.modelo,
          total_viagens: 1,
          total_km: v.distancia_percorrida ?? 0,
        });
      }
    }

    return [...mapa.values()].sort((a, b) => b.total_km - a.total_km);
  }
}
