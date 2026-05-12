import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../common/prisma/prisma.service';
import { agoraBrasilia } from '@fleetops/utils/datetime';
import { calcularPaginacao } from '../../common/utils/paginacao';
import { CriarDespesaDto, TipoDespesaEnum } from './dto/criar-despesa.dto';
import { AtualizarDespesaDto } from './dto/atualizar-despesa.dto';
import { DespesaRespostaDto } from './dto/despesa-resposta.dto';
import { FiltrosListarDespesasDto } from './dto/filtros-listar-despesas.dto';
import type { RespostaPaginada } from '@fleetops/types';

type DespesaPrisma = {
  id: string;
  veiculoId: string;
  tipo: string;
  data: Date;
  valor: Decimal;
  descricao: string;
  observacoes: string | null;
  odometro: number | null;
  litros: Decimal | null;
  precoLitro: Decimal | null;
  tipoCombustivel: string | null;
  tipoManutencao: string | null;
  oficina: string | null;
  numeroAuto: string | null;
  gravidade: string | null;
  pontosCnh: number | null;
  dataVencimento: Date | null;
  dataCriacao: Date;
};

@Injectable()
export class DespesasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros: FiltrosListarDespesasDto,
  ): Promise<RespostaPaginada<DespesaRespostaDto>> {
    const { pagina, tamanhoPagina, skip } = calcularPaginacao(filtros);

    const where = {
      dataExclusao: null as null,
      ...(filtros.veiculoId && { veiculoId: filtros.veiculoId }),
      ...(filtros.tipo && { tipo: filtros.tipo }),
      ...((filtros.dataInicio || filtros.dataFim) && {
        data: {
          ...(filtros.dataInicio && { gte: new Date(filtros.dataInicio) }),
          ...(filtros.dataFim && { lte: new Date(filtros.dataFim) }),
        },
      }),
    };

    const [total, despesas] = await Promise.all([
      this.prisma.despesaVeiculo.count({ where }),
      this.prisma.despesaVeiculo.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: { data: 'desc' },
      }),
    ]);

    return {
      dados: despesas.map((d) => this.mapear(d)),
      total,
      pagina,
      tamanhoPagina,
      totalPaginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async buscarPorId(id: string): Promise<DespesaRespostaDto> {
    const d = await this.prisma.despesaVeiculo.findFirst({
      where: { id, dataExclusao: null },
    });
    if (!d) throw new NotFoundException('Despesa não encontrada');
    return this.mapear(d);
  }

  async criar(dto: CriarDespesaDto): Promise<DespesaRespostaDto> {
    await this.garantirVeiculoExiste(dto.veiculoId);
    this.validarCamposEspecificos(dto);

    const criada = await this.prisma.despesaVeiculo.create({
      data: {
        veiculoId: dto.veiculoId,
        tipo: dto.tipo,
        data: new Date(dto.data),
        valor: new Decimal(dto.valor),
        descricao: dto.descricao,
        observacoes: dto.observacoes ?? null,
        odometro: dto.odometro ?? null,
        litros: dto.litros != null ? new Decimal(dto.litros) : null,
        precoLitro: dto.precoLitro != null ? new Decimal(dto.precoLitro) : null,
        tipoCombustivel: dto.tipoCombustivel ?? null,
        tipoManutencao: dto.tipoManutencao ?? null,
        oficina: dto.oficina ?? null,
        numeroAuto: dto.numeroAuto ?? null,
        gravidade: dto.gravidade ?? null,
        pontosCnh: dto.pontosCnh ?? null,
        dataVencimento: dto.dataVencimento ? new Date(dto.dataVencimento) : null,
      },
    });

    return this.mapear(criada);
  }

  async atualizar(
    id: string,
    dto: AtualizarDespesaDto,
  ): Promise<DespesaRespostaDto> {
    const existente = await this.prisma.despesaVeiculo.findFirst({
      where: { id, dataExclusao: null },
    });
    if (!existente) throw new NotFoundException('Despesa não encontrada');

    if (dto.tipo) this.validarCamposEspecificos({ ...existente, ...dto } as CriarDespesaDto);

    const atualizada = await this.prisma.despesaVeiculo.update({
      where: { id },
      data: {
        ...(dto.tipo !== undefined && { tipo: dto.tipo }),
        ...(dto.data !== undefined && { data: new Date(dto.data) }),
        ...(dto.valor !== undefined && { valor: new Decimal(dto.valor) }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes ?? null }),
        ...(dto.odometro !== undefined && { odometro: dto.odometro ?? null }),
        ...(dto.litros !== undefined && {
          litros: dto.litros != null ? new Decimal(dto.litros) : null,
        }),
        ...(dto.precoLitro !== undefined && {
          precoLitro: dto.precoLitro != null ? new Decimal(dto.precoLitro) : null,
        }),
        ...(dto.tipoCombustivel !== undefined && { tipoCombustivel: dto.tipoCombustivel ?? null }),
        ...(dto.tipoManutencao !== undefined && { tipoManutencao: dto.tipoManutencao ?? null }),
        ...(dto.oficina !== undefined && { oficina: dto.oficina ?? null }),
        ...(dto.numeroAuto !== undefined && { numeroAuto: dto.numeroAuto ?? null }),
        ...(dto.gravidade !== undefined && { gravidade: dto.gravidade ?? null }),
        ...(dto.pontosCnh !== undefined && { pontosCnh: dto.pontosCnh ?? null }),
        ...(dto.dataVencimento !== undefined && {
          dataVencimento: dto.dataVencimento ? new Date(dto.dataVencimento) : null,
        }),
      },
    });

    return this.mapear(atualizada);
  }

  async excluir(id: string): Promise<void> {
    const existente = await this.prisma.despesaVeiculo.findFirst({
      where: { id, dataExclusao: null },
    });
    if (!existente) throw new NotFoundException('Despesa não encontrada');

    await this.prisma.despesaVeiculo.update({
      where: { id },
      data: { dataExclusao: agoraBrasilia() },
    });
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  private async garantirVeiculoExiste(veiculoId: string): Promise<void> {
    const v = await this.prisma.veiculo.findFirst({
      where: { id: veiculoId, dataExclusao: null },
    });
    if (!v) throw new NotFoundException('Veículo não encontrado');
  }

  private validarCamposEspecificos(dto: CriarDespesaDto): void {
    if (dto.tipo === TipoDespesaEnum.ABASTECIMENTO) {
      if (dto.litros == null || dto.precoLitro == null || !dto.tipoCombustivel) {
        throw new BadRequestException(
          'Abastecimento exige litros, preço por litro e tipo de combustível',
        );
      }
    }
    if (dto.tipo === TipoDespesaEnum.MANUTENCAO && !dto.tipoManutencao) {
      throw new BadRequestException('Manutenção exige tipo (preventiva ou corretiva)');
    }
    if (dto.tipo === TipoDespesaEnum.MULTA && !dto.gravidade) {
      throw new BadRequestException('Multa exige gravidade');
    }
  }

  private mapear(d: DespesaPrisma): DespesaRespostaDto {
    return {
      id: d.id,
      veiculoId: d.veiculoId,
      tipo: d.tipo,
      data: d.data.toISOString().split('T')[0],
      valor: Number(d.valor),
      descricao: d.descricao,
      observacoes: d.observacoes,
      odometro: d.odometro,
      litros: d.litros != null ? Number(d.litros) : null,
      precoLitro: d.precoLitro != null ? Number(d.precoLitro) : null,
      tipoCombustivel: d.tipoCombustivel,
      tipoManutencao: d.tipoManutencao,
      oficina: d.oficina,
      numeroAuto: d.numeroAuto,
      gravidade: d.gravidade,
      pontosCnh: d.pontosCnh,
      dataVencimento: d.dataVencimento ? d.dataVencimento.toISOString().split('T')[0] : null,
      dataCriacao: d.dataCriacao.toISOString(),
    };
  }
}
