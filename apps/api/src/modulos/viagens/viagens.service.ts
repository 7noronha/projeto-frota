import { Prisma } from '@prisma/client';
import { calcularPaginacao } from '../../common/utils/paginacao';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { agoraBrasilia, formatarDataHoraBrasilia } from '@fleetops/utils/datetime';
import { UsuarioJwt, RespostaPaginada } from '@fleetops/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CriarViagemDto } from './dto/criar-viagem.dto';
import { AtualizarViagemDto } from './dto/atualizar-viagem.dto';
import { IniciarViagemDto } from './dto/iniciar-viagem.dto';
import { FinalizarViagemDto } from './dto/finalizar-viagem.dto';
import { ViagemRespostaDto } from './dto/viagem-resposta.dto';
import { FiltrosListarViagensDto } from './dto/filtros-listar-viagens.dto';
import { CriarPosicaoDto, PosicaoRespostaDto } from './dto/criar-posicao.dto';
import { GeocodingService, CoordenadasGeocode } from '../../common/geocoding/geocoding.service';
import { DirectionsService } from '../../common/geocoding/directions.service';
import { VelocidadeService } from '../relatorios/velocidade.service';
import { PushNotificationService } from '../../common/notificacoes/push-notification.service';

function horaParaDate(hora: string): Date {
  const [horas, minutos] = hora.split(':').map(Number);
  const d = new Date(0);
  d.setUTCHours(horas ?? 0, minutos ?? 0, 0, 0);
  return d;
}

function dateParaHora(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

type ViagemComRelacoes = {
  id: number;
  origem: string;
  destino: string;
  origem_latitude: Prisma.Decimal | null;
  origem_longitude: Prisma.Decimal | null;
  destino_latitude: Prisma.Decimal | null;
  destino_longitude: Prisma.Decimal | null;
  rota_geometria: Prisma.JsonValue | null;
  rota_distancia_km: Prisma.Decimal | null;
  rota_duracao_min: number | null;
  data_viagem: Date;
  hora_inicio_prevista: Date;
  hora_fim_prevista: Date;
  data_hora_inicio_real: Date | null;
  data_hora_fim_real: Date | null;
  odometro_inicial: number | null;
  odometro_final: number | null;
  distancia_percorrida: number | null;
  motorista_id: number;
  veiculo_id: number;
  operador_criador_id: number;
  solicitado_por: string;
  autorizado_por: string;
  observacoes: string | null;
  status_id: number;
  data_hora_criacao: Date;
  motorista: { id: number; nome: string; matricula: string };
  veiculo: { id: number; placa: string; marca: string; modelo: string; odometro_atual: number };
  status: { id: number; nome: string; descricao: string | null };
};

const INCLUDE_RELACOES = {
  motorista: { select: { id: true, nome: true, matricula: true } },
  veiculo: { select: { id: true, placa: true, marca: true, modelo: true, odometro_atual: true } },
  status: true,
} as const;

@Injectable()
export class ViagensService {
  private cacheSede: { valor: string; expiradoEm: number } | null = null;
  private cacheSedeCoords: { endereco: string; coords: CoordenadasGeocode | null } | null = null;
  private cacheStatus = new Map<string, number>(); // nome → id

  constructor(
    private readonly prisma: PrismaService,
    private readonly geocoding: GeocodingService,
    private readonly directions: DirectionsService,
    private readonly velocidade: VelocidadeService,
    private readonly push: PushNotificationService,
  ) {}

  /** Resolve id do status pelo nome (cacheado). */
  private async statusId(nome: string): Promise<number> {
    if (this.cacheStatus.has(nome)) return this.cacheStatus.get(nome)!;
    const s = await this.prisma.status_viagem.findUnique({ where: { nome } });
    if (!s) throw new BadRequestException(`Status '${nome}' não cadastrado`);
    this.cacheStatus.set(nome, s.id);
    return s.id;
  }

  private async buscarConflitoDePeriodo(params: {
    campoFiltro: 'motorista_id' | 'veiculo_id';
    idAlvo: number;
    dataViagem: Date;
    horaInicio: Date;
    horaFim: Date;
    idExcluir?: number;
  }): Promise<{ id: number; hora_inicio_prevista: Date; hora_fim_prevista: Date } | null> {
    const { campoFiltro, idAlvo, dataViagem, horaInicio, horaFim, idExcluir } = params;
    const statusAtivos = await this.prisma.status_viagem.findMany({
      where: { nome: { in: ['CRIADA', 'EM_ANDAMENTO'] } },
      select: { id: true },
    });
    return this.prisma.viagens.findFirst({
      where: {
        [campoFiltro]: idAlvo,
        data_viagem: dataViagem,
        status_id: { in: statusAtivos.map((s) => s.id) },
        data_hora_exclusao: null,
        ...(idExcluir && { NOT: { id: idExcluir } }),
        AND: [
          { hora_inicio_prevista: { lt: horaFim } },
          { hora_fim_prevista: { gt: horaInicio } },
        ],
      },
      select: { id: true, hora_inicio_prevista: true, hora_fim_prevista: true },
    });
  }

  private descreverConflito(conflito: {
    hora_inicio_prevista: Date;
    hora_fim_prevista: Date;
  }): string {
    return `das ${dateParaHora(conflito.hora_inicio_prevista)} às ${dateParaHora(conflito.hora_fim_prevista)}`;
  }

  private async obterEnderecoSede(): Promise<string> {
    const agora = Date.now();
    if (this.cacheSede && this.cacheSede.expiradoEm > agora) {
      return this.cacheSede.valor;
    }
    const config = await this.prisma.configuracoes.findFirst({ where: { chave: 'endereco_sede' } });
    if (!config) {
      throw new BadRequestException('Endereço da sede não configurado no sistema');
    }
    this.cacheSede = { valor: config.valor, expiradoEm: agora + 5 * 60 * 1000 };
    return config.valor;
  }

  private async obterCoordenadasSede(endereco: string): Promise<CoordenadasGeocode | null> {
    if (this.cacheSedeCoords && this.cacheSedeCoords.endereco === endereco) {
      return this.cacheSedeCoords.coords;
    }
    const coords = await this.geocoding.geocodificar(endereco);
    this.cacheSedeCoords = { endereco, coords };
    return coords;
  }

  async listar(
    filtros: FiltrosListarViagensDto,
    usuario: UsuarioJwt,
  ): Promise<RespostaPaginada<ViagemRespostaDto>> {
    const { pagina, tamanhoPagina, skip } = calcularPaginacao(filtros);
    const ehMotorista = usuario.perfil === 'motorista';

    const where = {
      data_hora_exclusao: null as null,
      ...(ehMotorista && { motorista_id: usuario.sub }),
      ...(filtros.status_id && { status_id: filtros.status_id }),
      ...(!ehMotorista && filtros.motorista_id && { motorista_id: filtros.motorista_id }),
      ...(filtros.veiculo_id && { veiculo_id: filtros.veiculo_id }),
      ...(filtros.dataInicio && filtros.dataFim && {
        data_viagem: { gte: new Date(filtros.dataInicio), lte: new Date(filtros.dataFim) },
      }),
    };

    const [total, viagens] = await Promise.all([
      this.prisma.viagens.count({ where }),
      this.prisma.viagens.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: { data_viagem: 'desc' },
        include: INCLUDE_RELACOES,
      }),
    ]);

    return {
      dados: viagens.map((v) => this.mapearResposta(v)),
      total,
      pagina,
      tamanho_pagina: tamanhoPagina,
      total_paginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async buscarPorId(id: number, usuario: UsuarioJwt): Promise<ViagemRespostaDto> {
    const viagem = await this.prisma.viagens.findFirst({
      where: { id, data_hora_exclusao: null },
      include: INCLUDE_RELACOES,
    });
    if (!viagem) throw new NotFoundException('Viagem não encontrada');

    if (usuario.perfil === 'motorista' && viagem.motorista_id !== usuario.sub) {
      throw new ForbiddenException('Acesso negado a esta viagem');
    }

    // Backfill preguiçoso de coordenadas
    const precisaOrigem = viagem.origem_latitude == null || viagem.origem_longitude == null;
    const precisaDestino = viagem.destino_latitude == null || viagem.destino_longitude == null;
    let viagemAtual = viagem;
    if (precisaOrigem || precisaDestino) {
      viagemAtual = await this.tentarBackfillCoordenadas(viagem, precisaOrigem, precisaDestino);
    }

    // Backfill da rota
    if (
      viagemAtual.rota_geometria == null &&
      viagemAtual.origem_latitude != null &&
      viagemAtual.origem_longitude != null &&
      viagemAtual.destino_latitude != null &&
      viagemAtual.destino_longitude != null
    ) {
      viagemAtual = await this.tentarBackfillRota(viagemAtual);
    }

    const vel = await this.velocidade.porMotorista(viagemAtual.motorista_id);
    return this.mapearResposta(viagemAtual, vel.velocidadeMediaKmH);
  }

  private async tentarBackfillRota(viagem: ViagemComRelacoes): Promise<ViagemComRelacoes> {
    const rota = await this.directions.rotear(
      { latitude: Number(viagem.origem_latitude), longitude: Number(viagem.origem_longitude) },
      { latitude: Number(viagem.destino_latitude), longitude: Number(viagem.destino_longitude) },
    );
    if (!rota) return viagem;

    return this.prisma.viagens.update({
      where: { id: viagem.id },
      data: {
        rota_geometria: rota.geometria as Prisma.InputJsonValue,
        rota_distancia_km: rota.distanciaKm,
        rota_duracao_min: Math.round(rota.duracaoMin),
      },
      include: INCLUDE_RELACOES,
    });
  }

  private async tentarBackfillCoordenadas(
    viagem: ViagemComRelacoes,
    precisaOrigem: boolean,
    precisaDestino: boolean,
  ): Promise<ViagemComRelacoes> {
    const [coordsOrigem, coordsDestino] = await Promise.all([
      precisaOrigem ? this.geocoding.geocodificar(viagem.origem) : Promise.resolve(null),
      precisaDestino ? this.geocoding.geocodificar(viagem.destino) : Promise.resolve(null),
    ]);
    if (!coordsOrigem && !coordsDestino) return viagem;

    return this.prisma.viagens.update({
      where: { id: viagem.id },
      data: {
        ...(coordsOrigem && {
          origem_latitude: coordsOrigem.latitude,
          origem_longitude: coordsOrigem.longitude,
        }),
        ...(coordsDestino && {
          destino_latitude: coordsDestino.latitude,
          destino_longitude: coordsDestino.longitude,
        }),
      },
      include: INCLUDE_RELACOES,
    });
  }

  async criar(dto: CriarViagemDto, operadorId: number): Promise<ViagemRespostaDto> {
    const enderecoSede = await this.obterEnderecoSede();

    if (dto.hora_fim_prevista <= dto.hora_inicio_prevista) {
      throw new BadRequestException('Hora de fim deve ser posterior à hora de início');
    }

    // Motorista — incluir perfil pra checar nome
    const motorista = await this.prisma.usuarios.findFirst({
      where: { id: dto.motorista_id, ativo: true, data_hora_exclusao: null },
      include: { perfil: true },
    });
    if (!motorista || motorista.perfil.nome !== 'motorista') {
      throw new NotFoundException('Motorista não encontrado ou inativo');
    }

    if (!motorista.cnh || !motorista.cnh_validade) {
      throw new BadRequestException('Motorista não possui CNH cadastrada');
    }
    const hoje = agoraBrasilia();
    if (motorista.cnh_validade < hoje) {
      throw new BadRequestException(
        `CNH do motorista vencida em ${motorista.cnh_validade.toISOString().split('T')[0]}`,
      );
    }

    // Veículo — situação ativo
    const ativo = await this.prisma.situacoes_veiculo.findUnique({ where: { nome: 'ativo' } });
    const veiculo = await this.prisma.veiculos.findFirst({
      where: {
        id: dto.veiculo_id,
        ...(ativo && { situacao_id: ativo.id }),
        data_hora_exclusao: null,
      },
    });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado ou não está ativo');

    const dataViagem = new Date(dto.data_viagem);
    const horaInicioNova = horaParaDate(dto.hora_inicio_prevista);
    const horaFimNova = horaParaDate(dto.hora_fim_prevista);

    const conflitoMotorista = await this.buscarConflitoDePeriodo({
      campoFiltro: 'motorista_id',
      idAlvo: dto.motorista_id,
      dataViagem,
      horaInicio: horaInicioNova,
      horaFim: horaFimNova,
    });
    if (conflitoMotorista) {
      throw new BadRequestException(
        `Motorista já possui viagem ${this.descreverConflito(conflitoMotorista)} nesta data com horário sobreposto.`,
      );
    }

    const conflitoVeiculo = await this.buscarConflitoDePeriodo({
      campoFiltro: 'veiculo_id',
      idAlvo: dto.veiculo_id,
      dataViagem,
      horaInicio: horaInicioNova,
      horaFim: horaFimNova,
    });
    if (conflitoVeiculo) {
      throw new BadRequestException(
        `Veículo já possui viagem ${this.descreverConflito(conflitoVeiculo)} nesta data com horário sobreposto.`,
      );
    }

    const [coordsOrigem, coordsDestino] = await Promise.all([
      this.obterCoordenadasSede(enderecoSede),
      this.geocoding.geocodificar(dto.destino),
    ]);
    const rota =
      coordsOrigem && coordsDestino ? await this.directions.rotear(coordsOrigem, coordsDestino) : null;

    const statusCriadaId = await this.statusId('CRIADA');

    const viagem = await this.prisma.viagens.create({
      data: {
        origem: enderecoSede,
        destino: dto.destino,
        origem_latitude: coordsOrigem?.latitude ?? null,
        origem_longitude: coordsOrigem?.longitude ?? null,
        destino_latitude: coordsDestino?.latitude ?? null,
        destino_longitude: coordsDestino?.longitude ?? null,
        rota_geometria: (rota?.geometria as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        rota_distancia_km: rota?.distanciaKm ?? null,
        rota_duracao_min: rota ? Math.round(rota.duracaoMin) : null,
        data_viagem: dataViagem,
        hora_inicio_prevista: horaInicioNova,
        hora_fim_prevista: horaFimNova,
        motorista_id: dto.motorista_id,
        veiculo_id: dto.veiculo_id,
        operador_criador_id: operadorId,
        solicitado_por: dto.solicitado_por,
        autorizado_por: dto.autorizado_por,
        observacoes: dto.observacoes ?? null,
        status_id: statusCriadaId,
      },
      include: INCLUDE_RELACOES,
    });

    // Push fire-and-forget
    const dataFmt = dataViagem.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'America/Sao_Paulo',
    });
    this.push
      .enviarParaUsuario(dto.motorista_id, {
        titulo: 'Nova viagem atribuída',
        corpo: `${dto.destino} · ${dataFmt} às ${dto.hora_inicio_prevista}`,
        dados: { tela: 'viagem', viagemId: viagem.id },
      })
      .catch(() => {});

    return this.mapearResposta(viagem);
  }

  async atualizar(id: number, dto: AtualizarViagemDto): Promise<ViagemRespostaDto> {
    const viagem = await this.prisma.viagens.findFirst({
      where: { id, data_hora_exclusao: null },
      include: { status: true },
    });
    if (!viagem) throw new NotFoundException('Viagem não encontrada');

    if (viagem.status.nome !== 'CRIADA') {
      throw new BadRequestException(
        `Não é possível editar viagem com status "${viagem.status.nome}". Apenas CRIADA pode ser editada.`,
      );
    }

    const dataViagem = dto.data_viagem ? new Date(dto.data_viagem) : viagem.data_viagem;
    const horaInicio = dto.hora_inicio_prevista
      ? horaParaDate(dto.hora_inicio_prevista)
      : viagem.hora_inicio_prevista;
    const horaFim = dto.hora_fim_prevista
      ? horaParaDate(dto.hora_fim_prevista)
      : viagem.hora_fim_prevista;
    const motoristaId = dto.motorista_id ?? viagem.motorista_id;
    const veiculoId = dto.veiculo_id ?? viagem.veiculo_id;

    if (horaFim <= horaInicio) {
      throw new BadRequestException('Hora de fim deve ser posterior à hora de início');
    }

    if (dto.motorista_id && dto.motorista_id !== viagem.motorista_id) {
      const motorista = await this.prisma.usuarios.findFirst({
        where: { id: motoristaId, ativo: true, data_hora_exclusao: null },
        include: { perfil: true },
      });
      if (!motorista || motorista.perfil.nome !== 'motorista') {
        throw new NotFoundException('Motorista não encontrado ou inativo');
      }
      if (!motorista.cnh || !motorista.cnh_validade) {
        throw new BadRequestException('Motorista não possui CNH cadastrada');
      }
      const hoje = agoraBrasilia();
      if (motorista.cnh_validade < hoje) {
        throw new BadRequestException(
          `CNH do motorista vencida em ${motorista.cnh_validade.toISOString().split('T')[0]}`,
        );
      }
    }

    if (dto.veiculo_id && dto.veiculo_id !== viagem.veiculo_id) {
      const ativo = await this.prisma.situacoes_veiculo.findUnique({ where: { nome: 'ativo' } });
      const veiculo = await this.prisma.veiculos.findFirst({
        where: {
          id: veiculoId,
          ...(ativo && { situacao_id: ativo.id }),
          data_hora_exclusao: null,
        },
      });
      if (!veiculo) throw new NotFoundException('Veículo não encontrado ou não está ativo');
    }

    const conflitoMotorista = await this.buscarConflitoDePeriodo({
      campoFiltro: 'motorista_id',
      idAlvo: motoristaId,
      dataViagem,
      horaInicio,
      horaFim,
      idExcluir: id,
    });
    if (conflitoMotorista) {
      throw new BadRequestException(
        `Motorista já possui viagem ${this.descreverConflito(conflitoMotorista)} nesta data.`,
      );
    }
    const conflitoVeiculo = await this.buscarConflitoDePeriodo({
      campoFiltro: 'veiculo_id',
      idAlvo: veiculoId,
      dataViagem,
      horaInicio,
      horaFim,
      idExcluir: id,
    });
    if (conflitoVeiculo) {
      throw new BadRequestException(
        `Veículo já possui viagem ${this.descreverConflito(conflitoVeiculo)} nesta data.`,
      );
    }

    const destinoMudou = dto.destino !== undefined && dto.destino !== viagem.destino;
    const coordsDestinoNovas = destinoMudou
      ? await this.geocoding.geocodificar(dto.destino as string)
      : null;

    const atualizada = await this.prisma.viagens.update({
      where: { id },
      data: {
        ...(dto.destino !== undefined && { destino: dto.destino }),
        ...(dto.data_viagem !== undefined && { data_viagem: dataViagem }),
        ...(dto.hora_inicio_prevista !== undefined && { hora_inicio_prevista: horaInicio }),
        ...(dto.hora_fim_prevista !== undefined && { hora_fim_prevista: horaFim }),
        ...(dto.motorista_id !== undefined && { motorista_id: motoristaId }),
        ...(dto.veiculo_id !== undefined && { veiculo_id: veiculoId }),
        ...(dto.solicitado_por !== undefined && { solicitado_por: dto.solicitado_por }),
        ...(dto.autorizado_por !== undefined && { autorizado_por: dto.autorizado_por }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes ?? null }),
        ...(destinoMudou && {
          destino_latitude: coordsDestinoNovas?.latitude ?? null,
          destino_longitude: coordsDestinoNovas?.longitude ?? null,
          rota_geometria: Prisma.JsonNull,
          rota_distancia_km: null,
          rota_duracao_min: null,
        }),
      },
      include: INCLUDE_RELACOES,
    });

    return this.mapearResposta(atualizada);
  }

  async iniciar(
    id: number,
    dto: IniciarViagemDto,
    usuario: UsuarioJwt,
  ): Promise<ViagemRespostaDto> {
    const viagem = await this.prisma.viagens.findFirst({
      where: { id, data_hora_exclusao: null },
      include: INCLUDE_RELACOES,
    });
    if (!viagem) throw new NotFoundException('Viagem não encontrada');

    if (viagem.status.nome !== 'CRIADA') {
      throw new BadRequestException(
        `Não é possível iniciar viagem com status "${viagem.status.nome}".`,
      );
    }
    if (usuario.perfil === 'motorista' && viagem.motorista_id !== usuario.sub) {
      throw new ForbiddenException('Motorista só pode iniciar suas próprias viagens');
    }
    if (dto.odometro_inicial < viagem.veiculo.odometro_atual) {
      throw new BadRequestException(
        `Odômetro inicial (${dto.odometro_inicial} km) menor que o odômetro atual do veículo (${viagem.veiculo.odometro_atual} km)`,
      );
    }

    const statusEmAndId = await this.statusId('EM_ANDAMENTO');
    const atualizada = await this.prisma.viagens.update({
      where: { id },
      data: {
        status_id: statusEmAndId,
        odometro_inicial: dto.odometro_inicial,
        data_hora_inicio_real: agoraBrasilia(),
      },
      include: INCLUDE_RELACOES,
    });
    return this.mapearResposta(atualizada);
  }

  async finalizar(
    id: number,
    dto: FinalizarViagemDto,
    usuario: UsuarioJwt,
  ): Promise<ViagemRespostaDto> {
    const viagem = await this.prisma.viagens.findFirst({
      where: { id, data_hora_exclusao: null },
      include: INCLUDE_RELACOES,
    });
    if (!viagem) throw new NotFoundException('Viagem não encontrada');

    if (viagem.status.nome !== 'EM_ANDAMENTO') {
      throw new BadRequestException(
        `Não é possível finalizar viagem com status "${viagem.status.nome}".`,
      );
    }
    if (usuario.perfil === 'motorista' && viagem.motorista_id !== usuario.sub) {
      throw new ForbiddenException('Motorista só pode finalizar suas próprias viagens');
    }

    const odometroInicial = viagem.odometro_inicial ?? 0;
    if (dto.odometro_final <= odometroInicial) {
      throw new BadRequestException(
        `Odômetro final (${dto.odometro_final} km) deve ser maior que o inicial (${odometroInicial} km)`,
      );
    }

    const distanciaPercorrida = dto.odometro_final - odometroInicial;
    const statusFinalId = await this.statusId('FINALIZADA');

    const [atualizada] = await this.prisma.$transaction([
      this.prisma.viagens.update({
        where: { id },
        data: {
          status_id: statusFinalId,
          odometro_final: dto.odometro_final,
          distancia_percorrida: distanciaPercorrida,
          data_hora_fim_real: agoraBrasilia(),
        },
        include: INCLUDE_RELACOES,
      }),
      this.prisma.veiculos.update({
        where: { id: viagem.veiculo_id },
        data: { odometro_atual: dto.odometro_final },
      }),
    ]);

    this.velocidade.invalidar(viagem.motorista_id);
    return this.mapearResposta(atualizada);
  }

  async registrarPosicao(
    viagemId: number,
    usuario: UsuarioJwt,
    dto: CriarPosicaoDto,
  ): Promise<PosicaoRespostaDto> {
    const viagem = await this.prisma.viagens.findFirst({
      where: { id: viagemId, data_hora_exclusao: null },
      select: { id: true, motorista_id: true, status: { select: { nome: true } } },
    });
    if (!viagem) throw new NotFoundException('Viagem não encontrada');

    if (usuario.perfil === 'motorista' && viagem.motorista_id !== usuario.sub) {
      throw new ForbiddenException('Motorista só pode reportar posição em suas próprias viagens');
    }
    if (usuario.perfil !== 'motorista') {
      throw new ForbiddenException('Apenas motoristas podem reportar posição');
    }
    if (viagem.status.nome !== 'EM_ANDAMENTO') {
      throw new BadRequestException(
        `Posição só pode ser registrada em viagens EM_ANDAMENTO (status atual: ${viagem.status.nome})`,
      );
    }

    const capturadoEm = dto.capturadoEm ? new Date(dto.capturadoEm) : agoraBrasilia();

    const criada = await this.prisma.posicoes_viagem.create({
      data: {
        viagem_id: viagemId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        precisao_m: dto.precisaoM ?? null,
        capturado_em: capturadoEm,
      },
    });

    return {
      id: criada.id,
      viagem_id: criada.viagem_id,
      latitude: Number(criada.latitude),
      longitude: Number(criada.longitude),
      precisao_m: criada.precisao_m != null ? Number(criada.precisao_m) : null,
      capturado_em: formatarDataHoraBrasilia(criada.capturado_em),
    };
  }

  async listarPosicoes(
    viagemId: number,
    usuario: UsuarioJwt,
    limite = 50,
  ): Promise<PosicaoRespostaDto[]> {
    const viagem = await this.prisma.viagens.findFirst({
      where: { id: viagemId, data_hora_exclusao: null },
      select: { motorista_id: true },
    });
    if (!viagem) throw new NotFoundException('Viagem não encontrada');

    if (usuario.perfil === 'motorista' && viagem.motorista_id !== usuario.sub) {
      throw new ForbiddenException('Acesso negado a esta viagem');
    }

    const posicoes = await this.prisma.posicoes_viagem.findMany({
      where: { viagem_id: viagemId },
      orderBy: { capturado_em: 'desc' },
      take: Math.min(Math.max(limite, 1), 500),
    });

    return posicoes.map((p) => ({
      id: p.id,
      viagem_id: p.viagem_id,
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      precisao_m: p.precisao_m != null ? Number(p.precisao_m) : null,
      capturado_em: formatarDataHoraBrasilia(p.capturado_em),
    }));
  }

  private mapearResposta(
    v: ViagemComRelacoes,
    velocidadeMediaKmH: number | null = null,
  ): ViagemRespostaDto {
    return {
      id: v.id,
      origem: v.origem,
      destino: v.destino,
      origem_latitude: v.origem_latitude != null ? Number(v.origem_latitude) : null,
      origem_longitude: v.origem_longitude != null ? Number(v.origem_longitude) : null,
      destino_latitude: v.destino_latitude != null ? Number(v.destino_latitude) : null,
      destino_longitude: v.destino_longitude != null ? Number(v.destino_longitude) : null,
      rota_geometria: v.rota_geometria,
      rota_distancia_km: v.rota_distancia_km != null ? Number(v.rota_distancia_km) : null,
      rota_duracao_min: v.rota_duracao_min,
      velocidade_media_km_h: velocidadeMediaKmH,
      data_viagem: v.data_viagem.toISOString().split('T')[0] ?? '',
      hora_inicio_prevista: dateParaHora(v.hora_inicio_prevista),
      hora_fim_prevista: dateParaHora(v.hora_fim_prevista),
      data_hora_inicio_real: v.data_hora_inicio_real
        ? formatarDataHoraBrasilia(v.data_hora_inicio_real)
        : null,
      data_hora_fim_real: v.data_hora_fim_real
        ? formatarDataHoraBrasilia(v.data_hora_fim_real)
        : null,
      odometro_inicial: v.odometro_inicial,
      odometro_final: v.odometro_final,
      distancia_percorrida: v.distancia_percorrida,
      motorista_id: v.motorista_id,
      motorista: v.motorista,
      veiculo_id: v.veiculo_id,
      veiculo: {
        id: v.veiculo.id,
        placa: v.veiculo.placa,
        marca: v.veiculo.marca,
        modelo: v.veiculo.modelo,
        odometro_atual: v.veiculo.odometro_atual,
      },
      operador_criador_id: v.operador_criador_id,
      solicitado_por: v.solicitado_por,
      autorizado_por: v.autorizado_por,
      observacoes: v.observacoes,
      status_id: v.status_id,
      status: { id: v.status.id, nome: v.status.nome, descricao: v.status.descricao },
      data_hora_criacao: formatarDataHoraBrasilia(v.data_hora_criacao),
    };
  }
}
