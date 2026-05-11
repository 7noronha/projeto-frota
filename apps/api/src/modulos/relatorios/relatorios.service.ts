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
    const viagens = await this.prisma.viagem.findMany({
      where: {
        status: 'FINALIZADA',
        dataExclusao: null,
        distanciaPercorrida: { not: null },
        ...(periodo && { dataViagem: periodo }),
      },
      select: {
        motoristaId: true,
        distanciaPercorrida: true,
        motorista: { select: { nome: true, matricula: true } },
      },
    });

    const mapa = new Map<string, AgregadoMotoristaDto>();
    for (const v of viagens) {
      const existente = mapa.get(v.motoristaId);
      if (existente) {
        existente.totalViagens += 1;
        existente.totalKm += v.distanciaPercorrida ?? 0;
      } else {
        mapa.set(v.motoristaId, {
          motoristaId: v.motoristaId,
          nome: v.motorista.nome,
          matricula: v.motorista.matricula,
          totalViagens: 1,
          totalKm: v.distanciaPercorrida ?? 0,
        });
      }
    }

    return [...mapa.values()].sort((a, b) => b.totalKm - a.totalKm);
  }

  async distanciaPorVeiculo(
    filtros: FiltrosPeriodoDto,
  ): Promise<AgregadoVeiculoDto[]> {
    const periodo = this.filtroPeriodo(filtros);
    const viagens = await this.prisma.viagem.findMany({
      where: {
        status: 'FINALIZADA',
        dataExclusao: null,
        distanciaPercorrida: { not: null },
        ...(periodo && { dataViagem: periodo }),
      },
      select: {
        veiculoId: true,
        distanciaPercorrida: true,
        veiculo: { select: { placa: true, marca: true, modelo: true } },
      },
    });

    const mapa = new Map<string, AgregadoVeiculoDto>();
    for (const v of viagens) {
      const existente = mapa.get(v.veiculoId);
      if (existente) {
        existente.totalViagens += 1;
        existente.totalKm += v.distanciaPercorrida ?? 0;
      } else {
        mapa.set(v.veiculoId, {
          veiculoId: v.veiculoId,
          placa: v.veiculo.placa,
          marca: v.veiculo.marca,
          modelo: v.veiculo.modelo,
          totalViagens: 1,
          totalKm: v.distanciaPercorrida ?? 0,
        });
      }
    }

    return [...mapa.values()].sort((a, b) => b.totalKm - a.totalKm);
  }
}
