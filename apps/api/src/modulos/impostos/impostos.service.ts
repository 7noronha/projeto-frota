import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { agoraBrasilia, formatarDataHoraBrasilia } from '@fleetops/utils/datetime';
import { PrismaService } from '../../common/prisma/prisma.service';
import { calcularPaginacao } from '../../common/utils/paginacao';
import type { RespostaPaginada } from '@fleetops/types';
import { CriarImpostoDto } from './dto/criar-imposto.dto';
import { AtualizarImpostoDto } from './dto/atualizar-imposto.dto';
import { ImpostoRespostaDto } from './dto/imposto-resposta.dto';
import { FiltrosListarImpostosDto } from './dto/filtros-listar-impostos.dto';
import { ImpostoHistoricoRespostaDto } from './dto/imposto-historico-resposta.dto';

type ImpostoComRelacoes = {
  id: number;
  veiculo_id: number;
  tipo_imposto_id: number;
  tipo_imposto: { id: number; nome: string; descricao: string | null };
  data: Date;
  valor: Decimal;
  descricao: string;
  ano_exercicio: number;
  numero_parcela: number | null;
  total_parcelas: number | null;
  data_vencimento: Date | null;
  observacoes: string | null;
  data_hora_criacao: Date;
};

const INCLUDE_TIPO = { tipo_imposto: true } as const;

const CAMPOS_AUDITAVEIS = [
  'tipo_imposto_id',
  'data',
  'valor',
  'descricao',
  'ano_exercicio',
  'numero_parcela',
  'total_parcelas',
  'data_vencimento',
  'observacoes',
] as const;

@Injectable()
export class ImpostosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosListarImpostosDto): Promise<RespostaPaginada<ImpostoRespostaDto>> {
    const { pagina, tamanhoPagina, skip } = calcularPaginacao(filtros);
    const where = {
      data_hora_exclusao: null as null,
      ...(filtros.veiculo_id && { veiculo_id: filtros.veiculo_id }),
      ...(filtros.tipo_imposto_id && { tipo_imposto_id: filtros.tipo_imposto_id }),
      ...(filtros.ano_exercicio && { ano_exercicio: filtros.ano_exercicio }),
    };

    const [total, impostos] = await Promise.all([
      this.prisma.impostos.count({ where }),
      this.prisma.impostos.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: [{ ano_exercicio: 'desc' }, { data: 'desc' }],
        include: INCLUDE_TIPO,
      }),
    ]);

    return {
      dados: impostos.map((i) => this.mapearResposta(i)),
      total,
      pagina,
      tamanho_pagina: tamanhoPagina,
      total_paginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async buscarPorId(id: number): Promise<ImpostoRespostaDto> {
    const i = await this.prisma.impostos.findFirst({
      where: { id, data_hora_exclusao: null },
      include: INCLUDE_TIPO,
    });
    if (!i) throw new NotFoundException('Imposto não encontrado');
    return this.mapearResposta(i);
  }

  async criar(dto: CriarImpostoDto): Promise<ImpostoRespostaDto> {
    await this.garantirFKs(dto.veiculo_id, dto.tipo_imposto_id);

    const criado = await this.prisma.impostos.create({
      data: {
        veiculo_id: dto.veiculo_id,
        tipo_imposto_id: dto.tipo_imposto_id,
        data: new Date(dto.data),
        valor: new Decimal(dto.valor),
        descricao: dto.descricao,
        ano_exercicio: dto.ano_exercicio,
        numero_parcela: dto.numero_parcela ?? null,
        total_parcelas: dto.total_parcelas ?? null,
        data_vencimento: dto.data_vencimento ? new Date(dto.data_vencimento) : null,
        observacoes: dto.observacoes ?? null,
      },
      include: INCLUDE_TIPO,
    });
    return this.mapearResposta(criado);
  }

  async atualizar(
    id: number,
    dto: AtualizarImpostoDto,
    usuarioId: number,
  ): Promise<ImpostoRespostaDto> {
    const existente = await this.prisma.impostos.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!existente) throw new NotFoundException('Imposto não encontrado');

    if (dto.tipo_imposto_id) {
      const t = await this.prisma.tipos_imposto.findUnique({
        where: { id: dto.tipo_imposto_id },
      });
      if (!t) throw new BadRequestException('Tipo de imposto inválido');
    }

    const novosValores = {
      ...(dto.tipo_imposto_id !== undefined && { tipo_imposto_id: dto.tipo_imposto_id }),
      ...(dto.data !== undefined && { data: new Date(dto.data) }),
      ...(dto.valor !== undefined && { valor: new Decimal(dto.valor) }),
      ...(dto.descricao !== undefined && { descricao: dto.descricao }),
      ...(dto.ano_exercicio !== undefined && { ano_exercicio: dto.ano_exercicio }),
      ...(dto.numero_parcela !== undefined && { numero_parcela: dto.numero_parcela ?? null }),
      ...(dto.total_parcelas !== undefined && { total_parcelas: dto.total_parcelas ?? null }),
      ...(dto.data_vencimento !== undefined && {
        data_vencimento: dto.data_vencimento ? new Date(dto.data_vencimento) : null,
      }),
      ...(dto.observacoes !== undefined && { observacoes: dto.observacoes ?? null }),
    };

    const historicos = this.calcularHistoricos(existente, novosValores, usuarioId);

    const atualizado = await this.prisma.$transaction(async (tx) => {
      if (historicos.length > 0) {
        await tx.impostos_historicos.createMany({
          data: historicos.map((h) => ({ ...h, imposto_id: id })),
        });
      }
      return tx.impostos.update({
        where: { id },
        data: novosValores,
        include: INCLUDE_TIPO,
      });
    });

    return this.mapearResposta(atualizado);
  }

  async excluir(id: number): Promise<void> {
    const existente = await this.prisma.impostos.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!existente) throw new NotFoundException('Imposto não encontrado');
    await this.prisma.impostos.update({
      where: { id },
      data: { data_hora_exclusao: agoraBrasilia() },
    });
  }

  async listarHistoricos(id: number): Promise<ImpostoHistoricoRespostaDto[]> {
    const imposto = await this.prisma.impostos.findFirst({
      where: { id, data_hora_exclusao: null },
      select: { id: true },
    });
    if (!imposto) throw new NotFoundException('Imposto não encontrado');

    const historicos = await this.prisma.impostos_historicos.findMany({
      where: { imposto_id: id },
      orderBy: { data_hora_alteracao: 'desc' },
    });

    return historicos.map((h) => ({
      id: h.id,
      imposto_id: h.imposto_id,
      campo: h.campo,
      valor_anterior: h.valor_anterior,
      valor_novo: h.valor_novo,
      alterado_por: h.alterado_por,
      data_hora_alteracao: formatarDataHoraBrasilia(h.data_hora_alteracao),
    }));
  }

  private calcularHistoricos(
    anterior: Record<string, unknown>,
    novos: Record<string, unknown>,
    usuarioId: number,
  ): Array<{ campo: string; valor_anterior: string | null; valor_novo: string | null; alterado_por: number }> {
    const out: Array<{
      campo: string;
      valor_anterior: string | null;
      valor_novo: string | null;
      alterado_por: number;
    }> = [];

    for (const campo of CAMPOS_AUDITAVEIS) {
      if (!(campo in novos)) continue;
      const antigo = anterior[campo];
      const novo = novos[campo];
      if (this.serializar(antigo) === this.serializar(novo)) continue;
      out.push({
        campo,
        valor_anterior: this.serializar(antigo),
        valor_novo: this.serializar(novo),
        alterado_por: usuarioId,
      });
    }
    return out;
  }

  private serializar(valor: unknown): string | null {
    if (valor === null || valor === undefined) return null;
    if (valor instanceof Date) return valor.toISOString();
    if (valor instanceof Decimal) return valor.toString();
    return String(valor);
  }

  private async garantirFKs(veiculoId: number, tipoId: number): Promise<void> {
    const [v, t] = await Promise.all([
      this.prisma.veiculos.findFirst({
        where: { id: veiculoId, data_hora_exclusao: null },
        select: { id: true },
      }),
      this.prisma.tipos_imposto.findUnique({ where: { id: tipoId } }),
    ]);
    if (!v) throw new NotFoundException('Veículo não encontrado');
    if (!t) throw new BadRequestException('Tipo de imposto inválido');
  }

  private mapearResposta(i: ImpostoComRelacoes): ImpostoRespostaDto {
    return {
      id: i.id,
      veiculo_id: i.veiculo_id,
      tipo_imposto_id: i.tipo_imposto_id,
      tipo_imposto: {
        id: i.tipo_imposto.id,
        nome: i.tipo_imposto.nome,
        descricao: i.tipo_imposto.descricao,
      },
      data: i.data.toISOString().split('T')[0] ?? '',
      valor: Number(i.valor),
      descricao: i.descricao,
      ano_exercicio: i.ano_exercicio,
      numero_parcela: i.numero_parcela,
      total_parcelas: i.total_parcelas,
      data_vencimento: i.data_vencimento
        ? i.data_vencimento.toISOString().split('T')[0] ?? null
        : null,
      observacoes: i.observacoes,
      data_hora_criacao: formatarDataHoraBrasilia(i.data_hora_criacao),
    };
  }
}
