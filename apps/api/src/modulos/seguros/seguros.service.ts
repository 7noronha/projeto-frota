import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { agoraBrasilia, formatarDataHoraBrasilia } from '@fleetops/utils/datetime';
import { PrismaService } from '../../common/prisma/prisma.service';
import { calcularPaginacao } from '../../common/utils/paginacao';
import type { RespostaPaginada } from '@fleetops/types';
import { CriarSeguroDto } from './dto/criar-seguro.dto';
import { AtualizarSeguroDto } from './dto/atualizar-seguro.dto';
import { SeguroRespostaDto } from './dto/seguro-resposta.dto';
import { FiltrosListarSegurosDto } from './dto/filtros-listar-seguros.dto';

type SeguroComRelacoes = {
  id: number;
  veiculo_id: number;
  tipo_cobertura_seguro_id: number;
  tipo_cobertura: { id: number; nome: string; descricao: string | null };
  data: Date;
  valor: Decimal;
  descricao: string;
  seguradora: string;
  numero_apolice: string | null;
  vigencia_inicio: Date;
  vigencia_fim: Date;
  observacoes: string | null;
  data_hora_criacao: Date;
};

const INCLUDE_TIPO = { tipo_cobertura: true } as const;

@Injectable()
export class SegurosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosListarSegurosDto): Promise<RespostaPaginada<SeguroRespostaDto>> {
    const { pagina, tamanhoPagina, skip } = calcularPaginacao(filtros);
    const where = {
      data_hora_exclusao: null as null,
      ...(filtros.veiculo_id && { veiculo_id: filtros.veiculo_id }),
      ...(filtros.tipo_cobertura_seguro_id && {
        tipo_cobertura_seguro_id: filtros.tipo_cobertura_seguro_id,
      }),
    };

    const [total, seguros] = await Promise.all([
      this.prisma.seguros.count({ where }),
      this.prisma.seguros.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: { vigencia_fim: 'desc' },
        include: INCLUDE_TIPO,
      }),
    ]);

    return {
      dados: seguros.map((s) => this.mapearResposta(s)),
      total,
      pagina,
      tamanho_pagina: tamanhoPagina,
      total_paginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async buscarPorId(id: number): Promise<SeguroRespostaDto> {
    const s = await this.prisma.seguros.findFirst({
      where: { id, data_hora_exclusao: null },
      include: INCLUDE_TIPO,
    });
    if (!s) throw new NotFoundException('Seguro não encontrado');
    return this.mapearResposta(s);
  }

  async criar(dto: CriarSeguroDto): Promise<SeguroRespostaDto> {
    await this.garantirFKs(dto.veiculo_id, dto.tipo_cobertura_seguro_id);
    this.validarVigencia(dto.vigencia_inicio, dto.vigencia_fim);

    const criado = await this.prisma.seguros.create({
      data: {
        veiculo_id: dto.veiculo_id,
        tipo_cobertura_seguro_id: dto.tipo_cobertura_seguro_id,
        data: new Date(dto.data),
        valor: new Decimal(dto.valor),
        descricao: dto.descricao,
        seguradora: dto.seguradora,
        numero_apolice: dto.numero_apolice ?? null,
        vigencia_inicio: new Date(dto.vigencia_inicio),
        vigencia_fim: new Date(dto.vigencia_fim),
        observacoes: dto.observacoes ?? null,
      },
      include: INCLUDE_TIPO,
    });
    return this.mapearResposta(criado);
  }

  async atualizar(id: number, dto: AtualizarSeguroDto): Promise<SeguroRespostaDto> {
    const existente = await this.prisma.seguros.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!existente) throw new NotFoundException('Seguro não encontrado');

    if (dto.tipo_cobertura_seguro_id) {
      const t = await this.prisma.tipos_cobertura_seguro.findUnique({
        where: { id: dto.tipo_cobertura_seguro_id },
      });
      if (!t) throw new BadRequestException('Tipo de cobertura inválido');
    }

    const vigenciaInicio = dto.vigencia_inicio
      ? new Date(dto.vigencia_inicio)
      : existente.vigencia_inicio;
    const vigenciaFim = dto.vigencia_fim ? new Date(dto.vigencia_fim) : existente.vigencia_fim;
    if (dto.vigencia_inicio || dto.vigencia_fim) {
      if (vigenciaFim < vigenciaInicio) {
        throw new BadRequestException('vigencia_fim não pode ser anterior a vigencia_inicio');
      }
    }

    const atualizado = await this.prisma.seguros.update({
      where: { id },
      data: {
        ...(dto.tipo_cobertura_seguro_id !== undefined && {
          tipo_cobertura_seguro_id: dto.tipo_cobertura_seguro_id,
        }),
        ...(dto.data !== undefined && { data: new Date(dto.data) }),
        ...(dto.valor !== undefined && { valor: new Decimal(dto.valor) }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(dto.seguradora !== undefined && { seguradora: dto.seguradora }),
        ...(dto.numero_apolice !== undefined && { numero_apolice: dto.numero_apolice ?? null }),
        ...(dto.vigencia_inicio !== undefined && { vigencia_inicio: new Date(dto.vigencia_inicio) }),
        ...(dto.vigencia_fim !== undefined && { vigencia_fim: new Date(dto.vigencia_fim) }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes ?? null }),
      },
      include: INCLUDE_TIPO,
    });
    return this.mapearResposta(atualizado);
  }

  async excluir(id: number): Promise<void> {
    const existente = await this.prisma.seguros.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!existente) throw new NotFoundException('Seguro não encontrado');
    await this.prisma.seguros.update({
      where: { id },
      data: { data_hora_exclusao: agoraBrasilia() },
    });
  }

  private validarVigencia(inicio: string, fim: string): void {
    if (new Date(fim) < new Date(inicio)) {
      throw new BadRequestException('vigencia_fim não pode ser anterior a vigencia_inicio');
    }
  }

  private async garantirFKs(veiculoId: number, tipoId: number): Promise<void> {
    const [v, t] = await Promise.all([
      this.prisma.veiculos.findFirst({
        where: { id: veiculoId, data_hora_exclusao: null },
        select: { id: true },
      }),
      this.prisma.tipos_cobertura_seguro.findUnique({ where: { id: tipoId } }),
    ]);
    if (!v) throw new NotFoundException('Veículo não encontrado');
    if (!t) throw new BadRequestException('Tipo de cobertura inválido');
  }

  private mapearResposta(s: SeguroComRelacoes): SeguroRespostaDto {
    return {
      id: s.id,
      veiculo_id: s.veiculo_id,
      tipo_cobertura_seguro_id: s.tipo_cobertura_seguro_id,
      tipo_cobertura: {
        id: s.tipo_cobertura.id,
        nome: s.tipo_cobertura.nome,
        descricao: s.tipo_cobertura.descricao,
      },
      data: s.data.toISOString().split('T')[0] ?? '',
      valor: Number(s.valor),
      descricao: s.descricao,
      seguradora: s.seguradora,
      numero_apolice: s.numero_apolice,
      vigencia_inicio: s.vigencia_inicio.toISOString().split('T')[0] ?? '',
      vigencia_fim: s.vigencia_fim.toISOString().split('T')[0] ?? '',
      observacoes: s.observacoes,
      data_hora_criacao: formatarDataHoraBrasilia(s.data_hora_criacao),
    };
  }
}
