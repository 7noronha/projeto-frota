import { calcularPaginacao } from '../../common/utils/paginacao';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import {
  agoraBrasilia,
  formatarDataBrasilia,
  formatarDataHoraBrasilia,
} from '@fleetops/utils/datetime';
import { RespostaPaginada, UsuarioJwt } from '@fleetops/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CriarVeiculoDto } from './dto/criar-veiculo.dto';
import { AtualizarVeiculoDto } from './dto/atualizar-veiculo.dto';
import { VeiculoRespostaDto } from './dto/veiculo-resposta.dto';
import { FiltrosListarVeiculosDto } from './dto/filtros-listar-veiculos.dto';
import { CriarAbastecimentoDto } from './dto/criar-abastecimento.dto';
import { AbastecimentoRespostaDto } from './dto/abastecimento-resposta.dto';

type VeiculoComSituacao = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  ano_modelo: number;
  cor: string;
  renavam: string;
  odometro_atual: number;
  data_aquisicao: Date;
  situacao_id: number;
  situacao: { id: number; nome: string; descricao: string | null };
  observacoes: string | null;
  data_hora_criacao: Date;
};

const INCLUDE_SITUACAO = { situacao: true } as const;

@Injectable()
export class VeiculosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosListarVeiculosDto): Promise<RespostaPaginada<VeiculoRespostaDto>> {
    const { pagina, tamanhoPagina, skip } = calcularPaginacao(filtros);

    // Resolve filtro `situacao` (nome) → situacao_id quando informado.
    // situacao_id explícito ganha precedência sobre o nome.
    let situacaoIdResolvido = filtros.situacao_id;
    if (!situacaoIdResolvido && filtros.situacao) {
      const situacao = await this.prisma.situacoes_veiculo.findUnique({
        where: { nome: filtros.situacao },
      });
      if (situacao) situacaoIdResolvido = situacao.id;
    }

    const where = {
      data_hora_exclusao: null as null,
      ...(situacaoIdResolvido && { situacao_id: situacaoIdResolvido }),
      ...(filtros.placa && { placa: { contains: filtros.placa, mode: 'insensitive' as const } }),
      ...(filtros.modelo && { modelo: { contains: filtros.modelo, mode: 'insensitive' as const } }),
    };

    const [total, veiculos] = await Promise.all([
      this.prisma.veiculos.count({ where }),
      this.prisma.veiculos.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: { data_hora_criacao: 'desc' },
        include: INCLUDE_SITUACAO,
      }),
    ]);

    return {
      dados: veiculos.map((v) => this.mapearResposta(v)),
      total,
      pagina,
      tamanho_pagina: tamanhoPagina,
      total_paginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async buscarPorId(id: number): Promise<VeiculoRespostaDto> {
    const veiculo = await this.prisma.veiculos.findFirst({
      where: { id, data_hora_exclusao: null },
      include: INCLUDE_SITUACAO,
    });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');
    return this.mapearResposta(veiculo);
  }

  async criar(dto: CriarVeiculoDto): Promise<VeiculoRespostaDto> {
    const situacao = await this.prisma.situacoes_veiculo.findUnique({ where: { id: dto.situacao_id } });
    if (!situacao) throw new ConflictException('Situação inválida');

    const [placaExistente, renavamExistente] = await Promise.all([
      this.prisma.veiculos.findFirst({ where: { placa: dto.placa, data_hora_exclusao: null } }),
      this.prisma.veiculos.findFirst({ where: { renavam: dto.renavam, data_hora_exclusao: null } }),
    ]);
    if (placaExistente) throw new ConflictException('Placa já está cadastrada');
    if (renavamExistente) throw new ConflictException('RENAVAM já está cadastrado');

    const veiculo = await this.prisma.veiculos.create({
      data: {
        placa: dto.placa.toUpperCase(),
        marca: dto.marca,
        modelo: dto.modelo,
        ano_fabricacao: dto.ano_fabricacao,
        ano_modelo: dto.ano_modelo,
        cor: dto.cor,
        renavam: dto.renavam,
        odometro_atual: dto.odometro_atual,
        data_aquisicao: new Date(dto.data_aquisicao),
        situacao_id: dto.situacao_id,
        observacoes: dto.observacoes ?? null,
      },
      include: INCLUDE_SITUACAO,
    });
    return this.mapearResposta(veiculo);
  }

  async atualizar(id: number, dto: AtualizarVeiculoDto): Promise<VeiculoRespostaDto> {
    const veiculo = await this.prisma.veiculos.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');

    const atualizado = await this.prisma.veiculos.update({
      where: { id },
      data: {
        ...(dto.marca && { marca: dto.marca }),
        ...(dto.modelo && { modelo: dto.modelo }),
        ...(dto.ano_fabricacao !== undefined && { ano_fabricacao: dto.ano_fabricacao }),
        ...(dto.ano_modelo !== undefined && { ano_modelo: dto.ano_modelo }),
        ...(dto.cor && { cor: dto.cor }),
        ...(dto.odometro_atual !== undefined && { odometro_atual: dto.odometro_atual }),
        ...(dto.data_aquisicao && { data_aquisicao: new Date(dto.data_aquisicao) }),
        ...(dto.situacao_id !== undefined && { situacao_id: dto.situacao_id }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes }),
      },
      include: INCLUDE_SITUACAO,
    });
    return this.mapearResposta(atualizado);
  }

  async excluir(id: number): Promise<void> {
    const veiculo = await this.prisma.veiculos.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');

    // Bloqueia exclusão se há viagem ativa (status CRIADA ou EM_ANDAMENTO)
    const statusAtivos = await this.prisma.status_viagem.findMany({
      where: { nome: { in: ['CRIADA', 'EM_ANDAMENTO'] } },
      select: { id: true },
    });
    const viagemAtiva = await this.prisma.viagens.findFirst({
      where: {
        veiculo_id: id,
        status_id: { in: statusAtivos.map((s) => s.id) },
        data_hora_exclusao: null,
      },
    });
    if (viagemAtiva) {
      throw new ConflictException(
        'Não é possível excluir um veículo com viagem ativa. Finalize a viagem antes.',
      );
    }

    const inativo = await this.prisma.situacoes_veiculo.findUnique({ where: { nome: 'inativo' } });
    await this.prisma.veiculos.update({
      where: { id },
      data: {
        situacao_id: inativo?.id ?? veiculo.situacao_id,
        data_hora_exclusao: agoraBrasilia(),
      },
    });
  }

  /**
   * Veículos das viagens do motorista logado (distintos, ativos).
   */
  async listarDoMotorista(motoristaSub: number): Promise<VeiculoRespostaDto[]> {
    const vinculos = await this.prisma.viagens.findMany({
      where: { motorista_id: motoristaSub, data_hora_exclusao: null },
      select: { veiculo_id: true },
      distinct: ['veiculo_id'],
    });
    const ids = vinculos.map((v) => v.veiculo_id);
    if (ids.length === 0) return [];

    const ativo = await this.prisma.situacoes_veiculo.findUnique({ where: { nome: 'ativo' } });
    const veiculos = await this.prisma.veiculos.findMany({
      where: {
        id: { in: ids },
        data_hora_exclusao: null,
        ...(ativo && { situacao_id: ativo.id }),
      },
      include: INCLUDE_SITUACAO,
      orderBy: { placa: 'asc' },
    });
    return veiculos.map((v) => this.mapearResposta(v));
  }

  /**
   * Motorista lança abastecimento. Cria registro em `abastecimentos`.
   */
  async criarAbastecimentoMotorista(
    veiculoId: number,
    dto: CriarAbastecimentoDto,
    usuario: UsuarioJwt,
  ): Promise<AbastecimentoRespostaDto> {
    if (usuario.perfil === 'motorista') {
      const vinculo = await this.prisma.viagens.findFirst({
        where: { motorista_id: usuario.sub, veiculo_id: veiculoId, data_hora_exclusao: null },
        select: { id: true },
      });
      if (!vinculo) {
        throw new ForbiddenException('Você só pode lançar abastecimento em veículos das suas viagens');
      }
    }

    const veiculo = await this.prisma.veiculos.findFirst({
      where: { id: veiculoId, data_hora_exclusao: null },
      select: { id: true },
    });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');

    const tipoComb = await this.prisma.tipos_combustivel.findUnique({
      where: { nome: dto.tipo_combustivel },
    });
    if (!tipoComb) throw new ConflictException('Tipo de combustível inválido');

    const data = dto.data ? new Date(dto.data) : agoraBrasilia();
    const descricao = dto.descricao?.trim() || 'Abastecimento';

    const criada = await this.prisma.abastecimentos.create({
      data: {
        veiculo_id: veiculoId,
        tipo_combustivel_id: tipoComb.id,
        data,
        valor: new Decimal(dto.valor),
        descricao,
        observacoes: dto.observacoes ?? null,
        odometro: dto.odometro ?? null,
        litros: new Decimal(dto.litros),
        preco_litro: new Decimal(dto.preco_litro),
      },
      include: { tipo_combustivel: true },
    });

    return {
      id: criada.id,
      veiculo_id: criada.veiculo_id,
      tipo: 'abastecimento',
      data: formatarDataBrasilia(criada.data, 'yyyy-MM-dd'),
      valor: Number(criada.valor),
      litros: Number(criada.litros),
      preco_litro: Number(criada.preco_litro),
      tipo_combustivel: criada.tipo_combustivel.nome,
      odometro: criada.odometro,
      descricao: criada.descricao,
      data_hora_criacao: formatarDataHoraBrasilia(criada.data_hora_criacao),
    };
  }

  private mapearResposta(v: VeiculoComSituacao): VeiculoRespostaDto {
    return {
      id: v.id,
      placa: v.placa,
      marca: v.marca,
      modelo: v.modelo,
      ano_fabricacao: v.ano_fabricacao,
      ano_modelo: v.ano_modelo,
      cor: v.cor,
      renavam: v.renavam,
      odometro_atual: v.odometro_atual,
      data_aquisicao: v.data_aquisicao.toISOString().split('T')[0] ?? '',
      situacao_id: v.situacao_id,
      situacao: { id: v.situacao.id, nome: v.situacao.nome, descricao: v.situacao.descricao },
      observacoes: v.observacoes,
      data_hora_criacao: formatarDataHoraBrasilia(v.data_hora_criacao),
    };
  }
}
