import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { agoraBrasilia, formatarDataHoraBrasilia } from '@fleetops/utils/datetime';
import { PrismaService } from '../../common/prisma/prisma.service';
import { calcularPaginacao } from '../../common/utils/paginacao';
import type { RespostaPaginada } from '@fleetops/types';
import { CriarMultaDto } from './dto/criar-multa.dto';
import { AtualizarMultaDto } from './dto/atualizar-multa.dto';
import { MultaRespostaDto } from './dto/multa-resposta.dto';
import { FiltrosListarMultasDto } from './dto/filtros-listar-multas.dto';

type MultaComRelacoes = {
  id: number;
  veiculo_id: number;
  gravidade_multa_id: number;
  gravidade: { id: number; nome: string; descricao: string | null };
  data: Date;
  valor: Decimal;
  descricao: string;
  numero_auto: string | null;
  pontos_cnh: number | null;
  data_vencimento: Date | null;
  observacoes: string | null;
  data_hora_criacao: Date;
};

const INCLUDE_GRAVIDADE = { gravidade: true } as const;

@Injectable()
export class MultasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosListarMultasDto): Promise<RespostaPaginada<MultaRespostaDto>> {
    const { pagina, tamanhoPagina, skip } = calcularPaginacao(filtros);
    const where = {
      data_hora_exclusao: null as null,
      ...(filtros.veiculo_id && { veiculo_id: filtros.veiculo_id }),
      ...(filtros.gravidade_multa_id && { gravidade_multa_id: filtros.gravidade_multa_id }),
      ...((filtros.dataInicio || filtros.dataFim) && {
        data: {
          ...(filtros.dataInicio && { gte: new Date(filtros.dataInicio) }),
          ...(filtros.dataFim && { lte: new Date(filtros.dataFim) }),
        },
      }),
    };

    const [total, multas] = await Promise.all([
      this.prisma.multas.count({ where }),
      this.prisma.multas.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: { data: 'desc' },
        include: INCLUDE_GRAVIDADE,
      }),
    ]);

    return {
      dados: multas.map((m) => this.mapearResposta(m)),
      total,
      pagina,
      tamanho_pagina: tamanhoPagina,
      total_paginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async buscarPorId(id: number): Promise<MultaRespostaDto> {
    const m = await this.prisma.multas.findFirst({
      where: { id, data_hora_exclusao: null },
      include: INCLUDE_GRAVIDADE,
    });
    if (!m) throw new NotFoundException('Multa não encontrada');
    return this.mapearResposta(m);
  }

  async criar(dto: CriarMultaDto): Promise<MultaRespostaDto> {
    await this.garantirFKs(dto.veiculo_id, dto.gravidade_multa_id);

    const criada = await this.prisma.multas.create({
      data: {
        veiculo_id: dto.veiculo_id,
        gravidade_multa_id: dto.gravidade_multa_id,
        data: new Date(dto.data),
        valor: new Decimal(dto.valor),
        descricao: dto.descricao,
        numero_auto: dto.numero_auto ?? null,
        pontos_cnh: dto.pontos_cnh ?? null,
        data_vencimento: dto.data_vencimento ? new Date(dto.data_vencimento) : null,
        observacoes: dto.observacoes ?? null,
      },
      include: INCLUDE_GRAVIDADE,
    });
    return this.mapearResposta(criada);
  }

  async atualizar(id: number, dto: AtualizarMultaDto): Promise<MultaRespostaDto> {
    const existente = await this.prisma.multas.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!existente) throw new NotFoundException('Multa não encontrada');

    if (dto.gravidade_multa_id) {
      const g = await this.prisma.gravidades_multa.findUnique({
        where: { id: dto.gravidade_multa_id },
      });
      if (!g) throw new BadRequestException('Gravidade inválida');
    }

    const atualizada = await this.prisma.multas.update({
      where: { id },
      data: {
        ...(dto.gravidade_multa_id !== undefined && { gravidade_multa_id: dto.gravidade_multa_id }),
        ...(dto.data !== undefined && { data: new Date(dto.data) }),
        ...(dto.valor !== undefined && { valor: new Decimal(dto.valor) }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(dto.numero_auto !== undefined && { numero_auto: dto.numero_auto ?? null }),
        ...(dto.pontos_cnh !== undefined && { pontos_cnh: dto.pontos_cnh ?? null }),
        ...(dto.data_vencimento !== undefined && {
          data_vencimento: dto.data_vencimento ? new Date(dto.data_vencimento) : null,
        }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes ?? null }),
      },
      include: INCLUDE_GRAVIDADE,
    });
    return this.mapearResposta(atualizada);
  }

  async excluir(id: number): Promise<void> {
    const existente = await this.prisma.multas.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!existente) throw new NotFoundException('Multa não encontrada');
    await this.prisma.multas.update({
      where: { id },
      data: { data_hora_exclusao: agoraBrasilia() },
    });
  }

  private async garantirFKs(veiculoId: number, gravidadeId: number): Promise<void> {
    const [v, g] = await Promise.all([
      this.prisma.veiculos.findFirst({
        where: { id: veiculoId, data_hora_exclusao: null },
        select: { id: true },
      }),
      this.prisma.gravidades_multa.findUnique({ where: { id: gravidadeId } }),
    ]);
    if (!v) throw new NotFoundException('Veículo não encontrado');
    if (!g) throw new BadRequestException('Gravidade inválida');
  }

  private mapearResposta(m: MultaComRelacoes): MultaRespostaDto {
    return {
      id: m.id,
      veiculo_id: m.veiculo_id,
      gravidade_multa_id: m.gravidade_multa_id,
      gravidade: {
        id: m.gravidade.id,
        nome: m.gravidade.nome,
        descricao: m.gravidade.descricao,
      },
      data: m.data.toISOString().split('T')[0] ?? '',
      valor: Number(m.valor),
      descricao: m.descricao,
      numero_auto: m.numero_auto,
      pontos_cnh: m.pontos_cnh,
      data_vencimento: m.data_vencimento ? m.data_vencimento.toISOString().split('T')[0] ?? null : null,
      observacoes: m.observacoes,
      data_hora_criacao: formatarDataHoraBrasilia(m.data_hora_criacao),
    };
  }
}
