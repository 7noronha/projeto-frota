import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { agoraBrasilia, formatarDataHoraBrasilia } from '@fleetops/utils/datetime';
import { PrismaService } from '../../common/prisma/prisma.service';
import { calcularPaginacao } from '../../common/utils/paginacao';
import type { RespostaPaginada } from '@fleetops/types';
import { CriarDocumentacaoDto } from './dto/criar-documentacao.dto';
import { AtualizarDocumentacaoDto } from './dto/atualizar-documentacao.dto';
import { DocumentacaoRespostaDto } from './dto/documentacao-resposta.dto';
import { FiltrosListarDocumentacoesDto } from './dto/filtros-listar-documentacoes.dto';

type DocComRelacoes = {
  id: number;
  veiculo_id: number;
  tipo_documento_veiculo_id: number;
  tipo_documento: { id: number; nome: string; descricao: string | null };
  data: Date;
  valor: Decimal;
  descricao: string;
  data_vencimento: Date | null;
  observacoes: string | null;
  data_hora_criacao: Date;
};

const INCLUDE_TIPO = { tipo_documento: true } as const;

@Injectable()
export class DocumentacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros: FiltrosListarDocumentacoesDto,
  ): Promise<RespostaPaginada<DocumentacaoRespostaDto>> {
    const { pagina, tamanhoPagina, skip } = calcularPaginacao(filtros);
    const where = {
      data_hora_exclusao: null as null,
      ...(filtros.veiculo_id && { veiculo_id: filtros.veiculo_id }),
      ...(filtros.tipo_documento_veiculo_id && {
        tipo_documento_veiculo_id: filtros.tipo_documento_veiculo_id,
      }),
      ...((filtros.dataInicio || filtros.dataFim) && {
        data: {
          ...(filtros.dataInicio && { gte: new Date(filtros.dataInicio) }),
          ...(filtros.dataFim && { lte: new Date(filtros.dataFim) }),
        },
      }),
    };

    const [total, docs] = await Promise.all([
      this.prisma.documentacoes.count({ where }),
      this.prisma.documentacoes.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: { data: 'desc' },
        include: INCLUDE_TIPO,
      }),
    ]);

    return {
      dados: docs.map((d) => this.mapearResposta(d)),
      total,
      pagina,
      tamanho_pagina: tamanhoPagina,
      total_paginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async buscarPorId(id: number): Promise<DocumentacaoRespostaDto> {
    const d = await this.prisma.documentacoes.findFirst({
      where: { id, data_hora_exclusao: null },
      include: INCLUDE_TIPO,
    });
    if (!d) throw new NotFoundException('Documentação não encontrada');
    return this.mapearResposta(d);
  }

  async criar(dto: CriarDocumentacaoDto): Promise<DocumentacaoRespostaDto> {
    await this.garantirFKs(dto.veiculo_id, dto.tipo_documento_veiculo_id);

    const criada = await this.prisma.documentacoes.create({
      data: {
        veiculo_id: dto.veiculo_id,
        tipo_documento_veiculo_id: dto.tipo_documento_veiculo_id,
        data: new Date(dto.data),
        valor: new Decimal(dto.valor),
        descricao: dto.descricao,
        data_vencimento: dto.data_vencimento ? new Date(dto.data_vencimento) : null,
        observacoes: dto.observacoes ?? null,
      },
      include: INCLUDE_TIPO,
    });
    return this.mapearResposta(criada);
  }

  async atualizar(id: number, dto: AtualizarDocumentacaoDto): Promise<DocumentacaoRespostaDto> {
    const existente = await this.prisma.documentacoes.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!existente) throw new NotFoundException('Documentação não encontrada');

    if (dto.tipo_documento_veiculo_id) {
      const t = await this.prisma.tipos_documento_veiculo.findUnique({
        where: { id: dto.tipo_documento_veiculo_id },
      });
      if (!t) throw new BadRequestException('Tipo de documento inválido');
    }

    const atualizada = await this.prisma.documentacoes.update({
      where: { id },
      data: {
        ...(dto.tipo_documento_veiculo_id !== undefined && {
          tipo_documento_veiculo_id: dto.tipo_documento_veiculo_id,
        }),
        ...(dto.data !== undefined && { data: new Date(dto.data) }),
        ...(dto.valor !== undefined && { valor: new Decimal(dto.valor) }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(dto.data_vencimento !== undefined && {
          data_vencimento: dto.data_vencimento ? new Date(dto.data_vencimento) : null,
        }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes ?? null }),
      },
      include: INCLUDE_TIPO,
    });
    return this.mapearResposta(atualizada);
  }

  async excluir(id: number): Promise<void> {
    const existente = await this.prisma.documentacoes.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!existente) throw new NotFoundException('Documentação não encontrada');
    await this.prisma.documentacoes.update({
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
      this.prisma.tipos_documento_veiculo.findUnique({ where: { id: tipoId } }),
    ]);
    if (!v) throw new NotFoundException('Veículo não encontrado');
    if (!t) throw new BadRequestException('Tipo de documento inválido');
  }

  private mapearResposta(d: DocComRelacoes): DocumentacaoRespostaDto {
    return {
      id: d.id,
      veiculo_id: d.veiculo_id,
      tipo_documento_veiculo_id: d.tipo_documento_veiculo_id,
      tipo_documento: {
        id: d.tipo_documento.id,
        nome: d.tipo_documento.nome,
        descricao: d.tipo_documento.descricao,
      },
      data: d.data.toISOString().split('T')[0] ?? '',
      valor: Number(d.valor),
      descricao: d.descricao,
      data_vencimento: d.data_vencimento ? d.data_vencimento.toISOString().split('T')[0] ?? null : null,
      observacoes: d.observacoes,
      data_hora_criacao: formatarDataHoraBrasilia(d.data_hora_criacao),
    };
  }
}
