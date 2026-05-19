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
import { SituacaoVeiculo, RespostaPaginada, UsuarioJwt } from '@fleetops/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CriarVeiculoDto, SituacaoVeiculoEnum } from './dto/criar-veiculo.dto';
import { AtualizarVeiculoDto } from './dto/atualizar-veiculo.dto';
import { VeiculoRespostaDto } from './dto/veiculo-resposta.dto';
import { FiltrosListarVeiculosDto } from './dto/filtros-listar-veiculos.dto';
import { CriarAbastecimentoDto } from './dto/criar-abastecimento.dto';
import { AbastecimentoRespostaDto } from './dto/abastecimento-resposta.dto';

type VeiculoPrisma = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  anoModelo: number;
  cor: string;
  renavam: string;
  odometroAtual: number;
  dataAquisicao: Date;
  situacao: string;
  observacoes: string | null;
  dataCriacao: Date;
};

const SELECT_VEICULO = {
  id: true,
  placa: true,
  marca: true,
  modelo: true,
  anoFabricacao: true,
  anoModelo: true,
  cor: true,
  renavam: true,
  odometroAtual: true,
  dataAquisicao: true,
  situacao: true,
  observacoes: true,
  dataCriacao: true,
} as const;

@Injectable()
export class VeiculosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosListarVeiculosDto): Promise<RespostaPaginada<VeiculoRespostaDto>> {
    const { pagina, tamanhoPagina, skip } = calcularPaginacao(filtros);

    const where = {
      dataExclusao: null as null,
      ...(filtros.situacao && { situacao: filtros.situacao }),
      ...(filtros.placa && { placa: { contains: filtros.placa, mode: 'insensitive' as const } }),
      ...(filtros.modelo && { modelo: { contains: filtros.modelo, mode: 'insensitive' as const } }),
    };

    const [total, veiculos] = await Promise.all([
      this.prisma.veiculo.count({ where }),
      this.prisma.veiculo.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: { dataCriacao: 'desc' },
        select: SELECT_VEICULO,
      }),
    ]);

    return {
      dados: veiculos.map((v) => this.mapearResposta(v)),
      total,
      pagina,
      tamanhoPagina,
      totalPaginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async buscarPorId(id: string): Promise<VeiculoRespostaDto> {
    const veiculo = await this.prisma.veiculo.findFirst({
      where: { id, dataExclusao: null },
      select: SELECT_VEICULO,
    });

    if (!veiculo) throw new NotFoundException('Veículo não encontrado');
    return this.mapearResposta(veiculo);
  }

  async criar(dto: CriarVeiculoDto): Promise<VeiculoRespostaDto> {
    const [placaExistente, renavamExistente] = await Promise.all([
      this.prisma.veiculo.findFirst({ where: { placa: dto.placa, dataExclusao: null } }),
      this.prisma.veiculo.findFirst({ where: { renavam: dto.renavam, dataExclusao: null } }),
    ]);

    if (placaExistente) throw new ConflictException('Placa já está cadastrada');
    if (renavamExistente) throw new ConflictException('RENAVAM já está cadastrado');

    const veiculo = await this.prisma.veiculo.create({
      data: {
        placa: dto.placa.toUpperCase(),
        marca: dto.marca,
        modelo: dto.modelo,
        anoFabricacao: dto.anoFabricacao,
        anoModelo: dto.anoModelo,
        cor: dto.cor,
        renavam: dto.renavam,
        odometroAtual: dto.odometroAtual,
        dataAquisicao: new Date(dto.dataAquisicao),
        situacao: dto.situacao,
        observacoes: dto.observacoes ?? null,
      },
      select: SELECT_VEICULO,
    });

    return this.mapearResposta(veiculo);
  }

  async atualizar(id: string, dto: AtualizarVeiculoDto): Promise<VeiculoRespostaDto> {
    const veiculo = await this.prisma.veiculo.findFirst({
      where: { id, dataExclusao: null },
    });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');

    const atualizado = await this.prisma.veiculo.update({
      where: { id },
      data: {
        ...(dto.marca && { marca: dto.marca }),
        ...(dto.modelo && { modelo: dto.modelo }),
        ...(dto.anoFabricacao !== undefined && { anoFabricacao: dto.anoFabricacao }),
        ...(dto.anoModelo !== undefined && { anoModelo: dto.anoModelo }),
        ...(dto.cor && { cor: dto.cor }),
        ...(dto.odometroAtual !== undefined && { odometroAtual: dto.odometroAtual }),
        ...(dto.dataAquisicao && { dataAquisicao: new Date(dto.dataAquisicao) }),
        ...(dto.situacao && { situacao: dto.situacao }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes }),
      },
      select: SELECT_VEICULO,
    });

    return this.mapearResposta(atualizado);
  }

  async excluir(id: string): Promise<void> {
    const veiculo = await this.prisma.veiculo.findFirst({
      where: { id, dataExclusao: null },
    });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');

    const viagemAtiva = await this.prisma.viagem.findFirst({
      where: {
        veiculoId: id,
        status: { in: ['CRIADA', 'EM_ANDAMENTO'] },
        dataExclusao: null,
      },
    });

    if (viagemAtiva) {
      throw new ConflictException(
        'Não é possível excluir um veículo com viagem ativa. Finalize a viagem antes.',
      );
    }

    await this.prisma.veiculo.update({
      where: { id },
      data: {
        situacao: 'inativo',
        dataExclusao: agoraBrasilia(),
      },
    });
  }

  private mapearResposta(veiculo: VeiculoPrisma): VeiculoRespostaDto {
    return {
      id: veiculo.id,
      placa: veiculo.placa,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      anoFabricacao: veiculo.anoFabricacao,
      anoModelo: veiculo.anoModelo,
      cor: veiculo.cor,
      renavam: veiculo.renavam,
      odometroAtual: veiculo.odometroAtual,
      dataAquisicao: veiculo.dataAquisicao.toISOString().split('T')[0] ?? '',
      situacao: veiculo.situacao as SituacaoVeiculo as SituacaoVeiculoEnum,
      observacoes: veiculo.observacoes,
      dataCriacao: formatarDataHoraBrasilia(veiculo.dataCriacao),
    };
  }

  /**
   * Veículos das viagens do motorista logado (distintos, ativos).
   * Base para o motorista escolher onde lançar o abastecimento.
   */
  async listarDoMotorista(motoristaSub: string): Promise<VeiculoRespostaDto[]> {
    const vinculos = await this.prisma.viagem.findMany({
      where: { motoristaId: motoristaSub, dataExclusao: null },
      select: { veiculoId: true },
      distinct: ['veiculoId'],
    });
    const ids = vinculos.map((v) => v.veiculoId);
    if (ids.length === 0) return [];

    const veiculos = await this.prisma.veiculo.findMany({
      where: { id: { in: ids }, dataExclusao: null, situacao: 'ativo' },
      select: SELECT_VEICULO,
      orderBy: { placa: 'asc' },
    });
    return veiculos.map((v) => this.mapearResposta(v));
  }

  /**
   * Motorista lança ABASTECIMENTO em um veículo. Só é permitido se o
   * motorista tiver ao menos uma viagem (não excluída) com esse veículo
   * (menor privilégio — sem vínculo a uma viagem específica/status).
   */
  async criarAbastecimentoMotorista(
    veiculoId: string,
    dto: CriarAbastecimentoDto,
    usuario: UsuarioJwt,
  ): Promise<AbastecimentoRespostaDto> {
    if (usuario.perfil === 'motorista') {
      const vinculo = await this.prisma.viagem.findFirst({
        where: { motoristaId: usuario.sub, veiculoId, dataExclusao: null },
        select: { id: true },
      });
      if (!vinculo) {
        throw new ForbiddenException(
          'Você só pode lançar abastecimento em veículos das suas viagens',
        );
      }
    }

    const veiculo = await this.prisma.veiculo.findFirst({
      where: { id: veiculoId, dataExclusao: null },
      select: { id: true },
    });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');

    const data = dto.data ? new Date(dto.data) : agoraBrasilia();
    const descricao = dto.descricao?.trim() || 'Abastecimento';

    const criada = await this.prisma.despesaVeiculo.create({
      data: {
        veiculoId,
        tipo: 'abastecimento',
        data,
        valor: new Decimal(dto.valor),
        descricao,
        observacoes: dto.observacoes ?? null,
        odometro: dto.odometro ?? null,
        litros: new Decimal(dto.litros),
        precoLitro: new Decimal(dto.precoLitro),
        tipoCombustivel: dto.tipoCombustivel,
      },
    });

    return {
      id: criada.id,
      veiculoId: criada.veiculoId,
      tipo: criada.tipo,
      data: formatarDataBrasilia(criada.data, 'yyyy-MM-dd'),
      valor: Number(criada.valor),
      litros: Number(criada.litros),
      precoLitro: Number(criada.precoLitro),
      tipoCombustivel: criada.tipoCombustivel ?? '',
      odometro: criada.odometro,
      descricao: criada.descricao,
      dataCriacao: formatarDataHoraBrasilia(criada.dataCriacao),
    };
  }
}
