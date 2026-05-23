import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { agoraBrasilia, formatarDataHoraBrasilia } from '@fleetops/utils/datetime';
import { PrismaService } from '../../common/prisma/prisma.service';
import { calcularPaginacao } from '../../common/utils/paginacao';
import type { RespostaPaginada } from '@fleetops/types';
import { CriarAbastecimentoDto } from './dto/criar-abastecimento.dto';
import { AtualizarAbastecimentoDto } from './dto/atualizar-abastecimento.dto';
import { AbastecimentoRespostaDto } from './dto/abastecimento-resposta.dto';
import { FiltrosListarAbastecimentosDto } from './dto/filtros-listar-abastecimentos.dto';

type AbastecimentoComRelacoes = {
  id: number;
  veiculo_id: number;
  tipo_combustivel_id: number;
  tipo_combustivel: { id: number; nome: string; descricao: string | null };
  data: Date;
  valor: Decimal;
  descricao: string;
  litros: Decimal;
  preco_litro: Decimal;
  odometro: number | null;
  observacoes: string | null;
  data_hora_criacao: Date;
};

const INCLUDE_TIPO = { tipo_combustivel: true } as const;

@Injectable()
export class AbastecimentosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros: FiltrosListarAbastecimentosDto,
  ): Promise<RespostaPaginada<AbastecimentoRespostaDto>> {
    const { pagina, tamanhoPagina, skip } = calcularPaginacao(filtros);

    const where = {
      data_hora_exclusao: null as null,
      ...(filtros.veiculo_id && { veiculo_id: filtros.veiculo_id }),
      ...(filtros.tipo_combustivel_id && { tipo_combustivel_id: filtros.tipo_combustivel_id }),
      ...((filtros.dataInicio || filtros.dataFim) && {
        data: {
          ...(filtros.dataInicio && { gte: new Date(filtros.dataInicio) }),
          ...(filtros.dataFim && { lte: new Date(filtros.dataFim) }),
        },
      }),
    };

    const [total, abastecimentos] = await Promise.all([
      this.prisma.abastecimentos.count({ where }),
      this.prisma.abastecimentos.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: { data: 'desc' },
        include: INCLUDE_TIPO,
      }),
    ]);

    return {
      dados: abastecimentos.map((a) => this.mapearResposta(a)),
      total,
      pagina,
      tamanho_pagina: tamanhoPagina,
      total_paginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async buscarPorId(id: number): Promise<AbastecimentoRespostaDto> {
    const a = await this.prisma.abastecimentos.findFirst({
      where: { id, data_hora_exclusao: null },
      include: INCLUDE_TIPO,
    });
    if (!a) throw new NotFoundException('Abastecimento não encontrado');
    return this.mapearResposta(a);
  }

  async criar(dto: CriarAbastecimentoDto): Promise<AbastecimentoRespostaDto> {
    await this.garantirFKs(dto.veiculo_id, dto.tipo_combustivel_id);

    const criado = await this.prisma.abastecimentos.create({
      data: {
        veiculo_id: dto.veiculo_id,
        tipo_combustivel_id: dto.tipo_combustivel_id,
        data: new Date(dto.data),
        valor: new Decimal(dto.valor),
        descricao: dto.descricao,
        litros: new Decimal(dto.litros),
        preco_litro: new Decimal(dto.preco_litro),
        odometro: dto.odometro ?? null,
        observacoes: dto.observacoes ?? null,
      },
      include: INCLUDE_TIPO,
    });
    return this.mapearResposta(criado);
  }

  async atualizar(id: number, dto: AtualizarAbastecimentoDto): Promise<AbastecimentoRespostaDto> {
    const existente = await this.prisma.abastecimentos.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!existente) throw new NotFoundException('Abastecimento não encontrado');

    if (dto.tipo_combustivel_id) {
      const tipo = await this.prisma.tipos_combustivel.findUnique({
        where: { id: dto.tipo_combustivel_id },
      });
      if (!tipo) throw new BadRequestException('Tipo de combustível inválido');
    }

    const atualizado = await this.prisma.abastecimentos.update({
      where: { id },
      data: {
        ...(dto.tipo_combustivel_id !== undefined && {
          tipo_combustivel_id: dto.tipo_combustivel_id,
        }),
        ...(dto.data !== undefined && { data: new Date(dto.data) }),
        ...(dto.valor !== undefined && { valor: new Decimal(dto.valor) }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(dto.litros !== undefined && { litros: new Decimal(dto.litros) }),
        ...(dto.preco_litro !== undefined && { preco_litro: new Decimal(dto.preco_litro) }),
        ...(dto.odometro !== undefined && { odometro: dto.odometro ?? null }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes ?? null }),
      },
      include: INCLUDE_TIPO,
    });
    return this.mapearResposta(atualizado);
  }

  async excluir(id: number): Promise<void> {
    const existente = await this.prisma.abastecimentos.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!existente) throw new NotFoundException('Abastecimento não encontrado');
    await this.prisma.abastecimentos.update({
      where: { id },
      data: { data_hora_exclusao: agoraBrasilia() },
    });
  }

  private async garantirFKs(veiculoId: number, tipoId: number): Promise<void> {
    const [v, t] = await Promise.all([
      this.prisma.veiculos.findFirst({
        where: { id: veiculoId, data_hora_exclusao: null },
        select: { id: true },
      }),
      this.prisma.tipos_combustivel.findUnique({ where: { id: tipoId } }),
    ]);
    if (!v) throw new NotFoundException('Veículo não encontrado');
    if (!t) throw new BadRequestException('Tipo de combustível inválido');
  }

  private mapearResposta(a: AbastecimentoComRelacoes): AbastecimentoRespostaDto {
    return {
      id: a.id,
      veiculo_id: a.veiculo_id,
      tipo_combustivel_id: a.tipo_combustivel_id,
      tipo_combustivel: {
        id: a.tipo_combustivel.id,
        nome: a.tipo_combustivel.nome,
        descricao: a.tipo_combustivel.descricao,
      },
      data: a.data.toISOString().split('T')[0] ?? '',
      valor: Number(a.valor),
      descricao: a.descricao,
      litros: Number(a.litros),
      preco_litro: Number(a.preco_litro),
      odometro: a.odometro,
      observacoes: a.observacoes,
      data_hora_criacao: formatarDataHoraBrasilia(a.data_hora_criacao),
    };
  }
}
