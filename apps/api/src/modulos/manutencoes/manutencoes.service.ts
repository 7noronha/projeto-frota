import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { agoraBrasilia, formatarDataHoraBrasilia } from '@fleetops/utils/datetime';
import { PrismaService } from '../../common/prisma/prisma.service';
import { calcularPaginacao } from '../../common/utils/paginacao';
import type { RespostaPaginada } from '@fleetops/types';
import { CriarManutencaoDto } from './dto/criar-manutencao.dto';
import { AtualizarManutencaoDto } from './dto/atualizar-manutencao.dto';
import { ManutencaoRespostaDto } from './dto/manutencao-resposta.dto';
import { FiltrosListarManutencoesDto } from './dto/filtros-listar-manutencoes.dto';

type ManutencaoComRelacoes = {
  id: number;
  veiculo_id: number;
  tipo_manutencao_id: number;
  tipo_manutencao: { id: number; nome: string; descricao: string | null };
  data: Date;
  valor: Decimal;
  descricao: string;
  oficina: string | null;
  odometro: number | null;
  observacoes: string | null;
  data_hora_criacao: Date;
};

const INCLUDE_TIPO = { tipo_manutencao: true } as const;

@Injectable()
export class ManutencoesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros: FiltrosListarManutencoesDto,
  ): Promise<RespostaPaginada<ManutencaoRespostaDto>> {
    const { pagina, tamanhoPagina, skip } = calcularPaginacao(filtros);

    const where = {
      data_hora_exclusao: null as null,
      ...(filtros.veiculo_id && { veiculo_id: filtros.veiculo_id }),
      ...(filtros.tipo_manutencao_id && { tipo_manutencao_id: filtros.tipo_manutencao_id }),
      ...((filtros.dataInicio || filtros.dataFim) && {
        data: {
          ...(filtros.dataInicio && { gte: new Date(filtros.dataInicio) }),
          ...(filtros.dataFim && { lte: new Date(filtros.dataFim) }),
        },
      }),
    };

    const [total, manutencoes] = await Promise.all([
      this.prisma.manutencoes.count({ where }),
      this.prisma.manutencoes.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: { data: 'desc' },
        include: INCLUDE_TIPO,
      }),
    ]);

    return {
      dados: manutencoes.map((m) => this.mapearResposta(m)),
      total,
      pagina,
      tamanho_pagina: tamanhoPagina,
      total_paginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async buscarPorId(id: number): Promise<ManutencaoRespostaDto> {
    const m = await this.prisma.manutencoes.findFirst({
      where: { id, data_hora_exclusao: null },
      include: INCLUDE_TIPO,
    });
    if (!m) throw new NotFoundException('Manutenção não encontrada');
    return this.mapearResposta(m);
  }

  async criar(dto: CriarManutencaoDto): Promise<ManutencaoRespostaDto> {
    await this.garantirFKs(dto.veiculo_id, dto.tipo_manutencao_id);

    const criada = await this.prisma.manutencoes.create({
      data: {
        veiculo_id: dto.veiculo_id,
        tipo_manutencao_id: dto.tipo_manutencao_id,
        data: new Date(dto.data),
        valor: new Decimal(dto.valor),
        descricao: dto.descricao,
        oficina: dto.oficina ?? null,
        odometro: dto.odometro ?? null,
        observacoes: dto.observacoes ?? null,
      },
      include: INCLUDE_TIPO,
    });

    return this.mapearResposta(criada);
  }

  async atualizar(id: number, dto: AtualizarManutencaoDto): Promise<ManutencaoRespostaDto> {
    const existente = await this.prisma.manutencoes.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!existente) throw new NotFoundException('Manutenção não encontrada');

    if (dto.tipo_manutencao_id) {
      const tipo = await this.prisma.tipos_manutencao.findUnique({
        where: { id: dto.tipo_manutencao_id },
      });
      if (!tipo) throw new BadRequestException('Tipo de manutenção inválido');
    }

    const atualizada = await this.prisma.manutencoes.update({
      where: { id },
      data: {
        ...(dto.tipo_manutencao_id !== undefined && { tipo_manutencao_id: dto.tipo_manutencao_id }),
        ...(dto.data !== undefined && { data: new Date(dto.data) }),
        ...(dto.valor !== undefined && { valor: new Decimal(dto.valor) }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(dto.oficina !== undefined && { oficina: dto.oficina ?? null }),
        ...(dto.odometro !== undefined && { odometro: dto.odometro ?? null }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes ?? null }),
      },
      include: INCLUDE_TIPO,
    });

    return this.mapearResposta(atualizada);
  }

  async excluir(id: number): Promise<void> {
    const existente = await this.prisma.manutencoes.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!existente) throw new NotFoundException('Manutenção não encontrada');

    await this.prisma.manutencoes.update({
      where: { id },
      data: { data_hora_exclusao: agoraBrasilia() },
    });
  }

  private async garantirFKs(veiculoId: number, tipoManutencaoId: number): Promise<void> {
    const [v, t] = await Promise.all([
      this.prisma.veiculos.findFirst({
        where: { id: veiculoId, data_hora_exclusao: null },
        select: { id: true },
      }),
      this.prisma.tipos_manutencao.findUnique({ where: { id: tipoManutencaoId } }),
    ]);
    if (!v) throw new NotFoundException('Veículo não encontrado');
    if (!t) throw new BadRequestException('Tipo de manutenção inválido');
  }

  private mapearResposta(m: ManutencaoComRelacoes): ManutencaoRespostaDto {
    return {
      id: m.id,
      veiculo_id: m.veiculo_id,
      tipo_manutencao_id: m.tipo_manutencao_id,
      tipo_manutencao: {
        id: m.tipo_manutencao.id,
        nome: m.tipo_manutencao.nome,
        descricao: m.tipo_manutencao.descricao,
      },
      data: m.data.toISOString().split('T')[0] ?? '',
      valor: Number(m.valor),
      descricao: m.descricao,
      oficina: m.oficina,
      odometro: m.odometro,
      observacoes: m.observacoes,
      data_hora_criacao: formatarDataHoraBrasilia(m.data_hora_criacao),
    };
  }
}
