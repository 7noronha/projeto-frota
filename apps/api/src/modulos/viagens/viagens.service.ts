import { Prisma } from '@prisma/client';
import { calcularPaginacao } from '../../common/utils/paginacao';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { agoraBrasilia, formatarDataHoraBrasilia } from '@fleetops/utils/datetime';
import { StatusViagem, UsuarioJwt, RespostaPaginada } from '@fleetops/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CriarViagemDto } from './dto/criar-viagem.dto';
import { AtualizarViagemDto } from './dto/atualizar-viagem.dto';
import { IniciarViagemDto } from './dto/iniciar-viagem.dto';
import { FinalizarViagemDto } from './dto/finalizar-viagem.dto';
import { ViagemRespostaDto } from './dto/viagem-resposta.dto';
import { FiltrosListarViagensDto } from './dto/filtros-listar-viagens.dto';
import { GeocodingService, CoordenadasGeocode } from '../../common/geocoding/geocoding.service';
import { DirectionsService } from '../../common/geocoding/directions.service';
import { VelocidadeService } from '../relatorios/velocidade.service';
import { PushNotificationService } from '../../common/notificacoes/push-notification.service';

// Converte "HH:MM" para Date (data epoch, hora UTC)
function horaParaDate(hora: string): Date {
  const [horas, minutos] = hora.split(':').map(Number);
  const d = new Date(0);
  d.setUTCHours(horas ?? 0, minutos ?? 0, 0, 0);
  return d;
}

// Converte Date de campo Time para "HH:MM"
function dateParaHora(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

type ViagemComRelacoes = {
  id: string;
  origem: string;
  destino: string;
  origemLatitude: Prisma.Decimal | null;
  origemLongitude: Prisma.Decimal | null;
  destinoLatitude: Prisma.Decimal | null;
  destinoLongitude: Prisma.Decimal | null;
  rotaGeometria: Prisma.JsonValue | null;
  rotaDistanciaKm: Prisma.Decimal | null;
  rotaDuracaoMin: number | null;
  dataViagem: Date;
  horaInicioPrevista: Date;
  horaFimPrevista: Date;
  dataHoraInicioReal: Date | null;
  dataHoraFimReal: Date | null;
  odometroInicial: number | null;
  odometroFinal: number | null;
  distanciaPercorrida: number | null;
  motoristaId: string;
  veiculoId: string;
  operadorCriadorId: string;
  solicitadoPor: string;
  autorizadoPor: string;
  observacoes: string | null;
  status: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
  dataExclusao: Date | null;
  motorista: { id: string; nome: string; matricula: string };
  veiculo: { id: string; placa: string; marca: string; modelo: string; odometroAtual: number };
};

const INCLUDE_RELACOES = {
  motorista: { select: { id: true, nome: true, matricula: true } },
  veiculo: { select: { id: true, placa: true, marca: true, modelo: true, odometroAtual: true } },
} as const;

@Injectable()
export class ViagensService {
  private cacheSede: { valor: string; expiradoEm: number } | null = null;
  private cacheSedeCoords: { endereco: string; coords: CoordenadasGeocode | null } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly geocoding: GeocodingService,
    private readonly directions: DirectionsService,
    private readonly velocidade: VelocidadeService,
    private readonly push: PushNotificationService,
  ) {}

  /**
   * Verifica sobreposição de período para um motorista ou veículo numa data.
   * Regra de overlap entre [a,b] e [c,d]: a < d AND c < b
   * Status considerados: CRIADA e EM_ANDAMENTO (FINALIZADA não bloqueia)
   * idExcluir: opcional, usado em "atualizar" para ignorar a própria viagem
   */
  private async buscarConflitoDePeriodo(params: {
    campoFiltro: 'motoristaId' | 'veiculoId';
    idAlvo: string;
    dataViagem: Date;
    horaInicio: Date;
    horaFim: Date;
    idExcluir?: string;
  }): Promise<{ id: string; horaInicioPrevista: Date; horaFimPrevista: Date } | null> {
    const { campoFiltro, idAlvo, dataViagem, horaInicio, horaFim, idExcluir } = params;
    return this.prisma.viagem.findFirst({
      where: {
        [campoFiltro]: idAlvo,
        dataViagem,
        status: { in: ['CRIADA', 'EM_ANDAMENTO'] },
        dataExclusao: null,
        ...(idExcluir && { NOT: { id: idExcluir } }),
        AND: [
          { horaInicioPrevista: { lt: horaFim } },
          { horaFimPrevista: { gt: horaInicio } },
        ],
      },
      select: { id: true, horaInicioPrevista: true, horaFimPrevista: true },
    });
  }

  private descreverConflito(conflito: {
    horaInicioPrevista: Date;
    horaFimPrevista: Date;
  }): string {
    return `das ${dateParaHora(conflito.horaInicioPrevista)} às ${dateParaHora(conflito.horaFimPrevista)}`;
  }

  private async obterEnderecoSede(): Promise<string> {
    const agora = Date.now();
    if (this.cacheSede && this.cacheSede.expiradoEm > agora) {
      return this.cacheSede.valor;
    }
    const config = await this.prisma.configuracao.findFirst({
      where: { chave: 'endereco_sede' },
    });
    if (!config) {
      throw new BadRequestException('Endereço da sede não configurado no sistema');
    }
    this.cacheSede = { valor: config.valor, expiradoEm: agora + 5 * 60 * 1000 };
    return config.valor;
  }

  /**
   * Geocoda o endereço da sede uma única vez por endereço — quando ele muda
   * em `configuracoes`, o cache invalida sozinho e refazemos a chamada.
   */
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
      dataExclusao: null as null,
      ...(ehMotorista && { motoristaId: usuario.sub }),
      ...(filtros.status && { status: filtros.status }),
      ...(!ehMotorista && filtros.motoristaId && { motoristaId: filtros.motoristaId }),
      ...(filtros.veiculoId && { veiculoId: filtros.veiculoId }),
      ...(filtros.dataInicio && filtros.dataFim && {
        dataViagem: {
          gte: new Date(filtros.dataInicio),
          lte: new Date(filtros.dataFim),
        },
      }),
    };

    const [total, viagens] = await Promise.all([
      this.prisma.viagem.count({ where }),
      this.prisma.viagem.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: { dataViagem: 'desc' },
        include: INCLUDE_RELACOES,
      }),
    ]);

    return {
      dados: viagens.map((v) => this.mapearResposta(v)),
      total,
      pagina,
      tamanhoPagina,
      totalPaginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async buscarPorId(id: string, usuario: UsuarioJwt): Promise<ViagemRespostaDto> {
    const viagem = await this.prisma.viagem.findFirst({
      where: { id, dataExclusao: null },
      include: INCLUDE_RELACOES,
    });

    if (!viagem) throw new NotFoundException('Viagem não encontrada');

    if (usuario.perfil === 'motorista' && viagem.motoristaId !== usuario.sub) {
      throw new ForbiddenException('Acesso negado a esta viagem');
    }

    // Backfill preguiçoso de coordenadas — viagens criadas antes do GPS ou
    // quando o MAPBOX_TOKEN ainda não estava setado entram aqui sem lat/lng.
    // Geocoda na primeira leitura e persiste. Best-effort: se falhar, segue.
    const precisaOrigem = viagem.origemLatitude == null || viagem.origemLongitude == null;
    const precisaDestino = viagem.destinoLatitude == null || viagem.destinoLongitude == null;
    let viagemAtual = viagem;
    if (precisaOrigem || precisaDestino) {
      viagemAtual = await this.tentarBackfillCoordenadas(viagem, precisaOrigem, precisaDestino);
    }

    // Backfill da rota (Directions API) — só depois das coords existirem
    if (
      viagemAtual.rotaGeometria == null &&
      viagemAtual.origemLatitude != null &&
      viagemAtual.origemLongitude != null &&
      viagemAtual.destinoLatitude != null &&
      viagemAtual.destinoLongitude != null
    ) {
      viagemAtual = await this.tentarBackfillRota(viagemAtual);
    }

    // Velocidade média calibrada pelo histórico do motorista
    const vel = await this.velocidade.porMotorista(viagemAtual.motoristaId);
    return this.mapearResposta(viagemAtual, vel.velocidadeMediaKmH);
  }

  /**
   * Tenta resolver a rota via Mapbox Directions e persistir no banco.
   * Best-effort: se falhar, devolve a viagem original sem rota.
   */
  private async tentarBackfillRota(viagem: ViagemComRelacoes): Promise<ViagemComRelacoes> {
    const rota = await this.directions.rotear(
      { latitude: Number(viagem.origemLatitude), longitude: Number(viagem.origemLongitude) },
      { latitude: Number(viagem.destinoLatitude), longitude: Number(viagem.destinoLongitude) },
    );
    if (!rota) return viagem;

    const atualizada = await this.prisma.viagem.update({
      where: { id: viagem.id },
      data: {
        rotaGeometria: rota.geometria as Prisma.InputJsonValue,
        rotaDistanciaKm: rota.distanciaKm,
        rotaDuracaoMin: Math.round(rota.duracaoMin),
      },
      include: INCLUDE_RELACOES,
    });
    return atualizada;
  }

  /**
   * Tenta resolver coords faltantes via Mapbox e persistir. Retorna a
   * viagem (atualizada se o geocoding funcionou, ou a original).
   */
  private async tentarBackfillCoordenadas(
    viagem: ViagemComRelacoes,
    precisaOrigem: boolean,
    precisaDestino: boolean,
  ): Promise<ViagemComRelacoes> {
    const [coordsOrigem, coordsDestino] = await Promise.all([
      precisaOrigem ? this.geocoding.geocodificar(viagem.origem) : Promise.resolve(null),
      precisaDestino ? this.geocoding.geocodificar(viagem.destino) : Promise.resolve(null),
    ]);

    if (!coordsOrigem && !coordsDestino) {
      return viagem;
    }

    const atualizada = await this.prisma.viagem.update({
      where: { id: viagem.id },
      data: {
        ...(coordsOrigem && {
          origemLatitude: coordsOrigem.latitude,
          origemLongitude: coordsOrigem.longitude,
        }),
        ...(coordsDestino && {
          destinoLatitude: coordsDestino.latitude,
          destinoLongitude: coordsDestino.longitude,
        }),
      },
      include: INCLUDE_RELACOES,
    });

    return atualizada;
  }

  async criar(dto: CriarViagemDto, operadorId: string): Promise<ViagemRespostaDto> {
    // 1. Endereço da sede (cacheado por 5 min)
    const enderecoSede = await this.obterEnderecoSede();

    // 2. Validar hora (fim > início)
    if (dto.horaFimPrevista <= dto.horaInicioPrevista) {
      throw new BadRequestException('Hora de fim deve ser posterior à hora de início');
    }

    // 3. Validar motorista
    const motorista = await this.prisma.usuario.findFirst({
      where: { id: dto.motoristaId, perfil: 'motorista', ativo: true, dataExclusao: null },
    });
    if (!motorista) throw new NotFoundException('Motorista não encontrado ou inativo');

    // 4. Validar CNH
    if (!motorista.cnh || !motorista.cnhValidade) {
      throw new BadRequestException('Motorista não possui CNH cadastrada');
    }
    const hoje = agoraBrasilia();
    if (motorista.cnhValidade < hoje) {
      throw new BadRequestException(
        `CNH do motorista vencida em ${motorista.cnhValidade.toISOString().split('T')[0]}`,
      );
    }

    // 5. Validar veículo
    const veiculo = await this.prisma.veiculo.findFirst({
      where: { id: dto.veiculoId, situacao: 'ativo', dataExclusao: null },
    });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado ou não está ativo');

    const dataViagem = new Date(dto.dataViagem);
    const horaInicioNova = horaParaDate(dto.horaInicioPrevista);
    const horaFimNova = horaParaDate(dto.horaFimPrevista);

    // 6. Conflito de período do motorista
    // (mesma data + sobreposição de horario com viagem CRIADA ou EM_ANDAMENTO)
    const conflitoMotorista = await this.buscarConflitoDePeriodo({
      campoFiltro: 'motoristaId',
      idAlvo: dto.motoristaId,
      dataViagem,
      horaInicio: horaInicioNova,
      horaFim: horaFimNova,
    });
    if (conflitoMotorista) {
      throw new BadRequestException(
        `Motorista já possui viagem ${this.descreverConflito(conflitoMotorista)} ` +
          'nesta data com horário sobreposto. Ajuste o horário ou escolha outro motorista.',
      );
    }

    // 7. Conflito de período do veículo
    const conflitoVeiculo = await this.buscarConflitoDePeriodo({
      campoFiltro: 'veiculoId',
      idAlvo: dto.veiculoId,
      dataViagem,
      horaInicio: horaInicioNova,
      horaFim: horaFimNova,
    });
    if (conflitoVeiculo) {
      throw new BadRequestException(
        `Veículo já possui viagem ${this.descreverConflito(conflitoVeiculo)} ` +
          'nesta data com horário sobreposto. Ajuste o horário ou escolha outro veículo.',
      );
    }

    // 8. Geocoding (best-effort) — origem = sede; destino = endereço informado.
    // Falhas não bloqueiam: viagem é criada sem coords se a API recusar.
    const [coordsOrigem, coordsDestino] = await Promise.all([
      this.obterCoordenadasSede(enderecoSede),
      this.geocoding.geocodificar(dto.destino),
    ]);

    // 9. Routing (best-effort) — só se os dois pontos foram geocodados
    const rota =
      coordsOrigem && coordsDestino
        ? await this.directions.rotear(coordsOrigem, coordsDestino)
        : null;

    const viagem = await this.prisma.viagem.create({
      data: {
        origem: enderecoSede,
        destino: dto.destino,
        origemLatitude: coordsOrigem?.latitude ?? null,
        origemLongitude: coordsOrigem?.longitude ?? null,
        destinoLatitude: coordsDestino?.latitude ?? null,
        destinoLongitude: coordsDestino?.longitude ?? null,
        rotaGeometria: (rota?.geometria as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        rotaDistanciaKm: rota?.distanciaKm ?? null,
        rotaDuracaoMin: rota ? Math.round(rota.duracaoMin) : null,
        dataViagem,
        horaInicioPrevista: horaParaDate(dto.horaInicioPrevista),
        horaFimPrevista: horaParaDate(dto.horaFimPrevista),
        motoristaId: dto.motoristaId,
        veiculoId: dto.veiculoId,
        operadorCriadorId: operadorId,
        solicitadoPor: dto.solicitadoPor,
        autorizadoPor: dto.autorizadoPor,
        observacoes: dto.observacoes ?? null,
        status: 'CRIADA',
      },
      include: INCLUDE_RELACOES,
    });

    // Notifica o motorista — fire-and-forget pra não bloquear a resposta.
    // O dataViagem vem em UTC, formatamos pra dd/MM em Brasília.
    const dataFmt = dataViagem.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'America/Sao_Paulo',
    });
    this.push
      .enviarParaUsuario(dto.motoristaId, {
        titulo: 'Nova viagem atribuída',
        corpo: `${dto.destino} · ${dataFmt} às ${dto.horaInicioPrevista}`,
        dados: { tela: 'viagem', viagemId: viagem.id },
      })
      .catch(() => {
        /* já loga internamente; ignora pra não derrubar a request */
      });

    return this.mapearResposta(viagem);
  }

  async atualizar(
    id: string,
    dto: AtualizarViagemDto,
  ): Promise<ViagemRespostaDto> {
    const viagem = await this.prisma.viagem.findFirst({
      where: { id, dataExclusao: null },
    });
    if (!viagem) throw new NotFoundException('Viagem não encontrada');

    if (viagem.status !== 'CRIADA') {
      throw new BadRequestException(
        `Não é possível editar viagem com status "${viagem.status}". ` +
          'Apenas viagens com status CRIADA podem ser editadas.',
      );
    }

    // Resolve campos finais (dto sobrescreve, mantém os atuais quando não informado)
    const dataViagem = dto.dataViagem ? new Date(dto.dataViagem) : viagem.dataViagem;
    const horaInicio = dto.horaInicioPrevista
      ? horaParaDate(dto.horaInicioPrevista)
      : viagem.horaInicioPrevista;
    const horaFim = dto.horaFimPrevista
      ? horaParaDate(dto.horaFimPrevista)
      : viagem.horaFimPrevista;
    const motoristaId = dto.motoristaId ?? viagem.motoristaId;
    const veiculoId = dto.veiculoId ?? viagem.veiculoId;

    // Valida hora fim > hora início
    if (horaFim <= horaInicio) {
      throw new BadRequestException('Hora de fim deve ser posterior à hora de início');
    }

    // Se mudou motorista, valida ativo + CNH
    if (dto.motoristaId && dto.motoristaId !== viagem.motoristaId) {
      const motorista = await this.prisma.usuario.findFirst({
        where: { id: motoristaId, perfil: 'motorista', ativo: true, dataExclusao: null },
      });
      if (!motorista) throw new NotFoundException('Motorista não encontrado ou inativo');
      if (!motorista.cnh || !motorista.cnhValidade) {
        throw new BadRequestException('Motorista não possui CNH cadastrada');
      }
      const hoje = agoraBrasilia();
      if (motorista.cnhValidade < hoje) {
        throw new BadRequestException(
          `CNH do motorista vencida em ${motorista.cnhValidade.toISOString().split('T')[0]}`,
        );
      }
    }

    // Se mudou veículo, valida ativo
    if (dto.veiculoId && dto.veiculoId !== viagem.veiculoId) {
      const veiculo = await this.prisma.veiculo.findFirst({
        where: { id: veiculoId, situacao: 'ativo', dataExclusao: null },
      });
      if (!veiculo) throw new NotFoundException('Veículo não encontrado ou não está ativo');
    }

    // Revalida conflito de período (excluindo a própria viagem)
    const conflitoMotorista = await this.buscarConflitoDePeriodo({
      campoFiltro: 'motoristaId',
      idAlvo: motoristaId,
      dataViagem,
      horaInicio,
      horaFim,
      idExcluir: id,
    });
    if (conflitoMotorista) {
      throw new BadRequestException(
        `Motorista já possui viagem ${this.descreverConflito(conflitoMotorista)} ` +
          'nesta data com horário sobreposto.',
      );
    }
    const conflitoVeiculo = await this.buscarConflitoDePeriodo({
      campoFiltro: 'veiculoId',
      idAlvo: veiculoId,
      dataViagem,
      horaInicio,
      horaFim,
      idExcluir: id,
    });
    if (conflitoVeiculo) {
      throw new BadRequestException(
        `Veículo já possui viagem ${this.descreverConflito(conflitoVeiculo)} ` +
          'nesta data com horário sobreposto.',
      );
    }

    // Se o destino mudou, re-geocoda (best-effort) e invalida o cache da rota.
    // O backfill de rota em buscarPorId vai recalcular na próxima leitura.
    const destinoMudou = dto.destino !== undefined && dto.destino !== viagem.destino;
    const coordsDestinoNovas = destinoMudou
      ? await this.geocoding.geocodificar(dto.destino as string)
      : null;

    const atualizada = await this.prisma.viagem.update({
      where: { id },
      data: {
        ...(dto.destino !== undefined && { destino: dto.destino }),
        ...(dto.dataViagem !== undefined && { dataViagem }),
        ...(dto.horaInicioPrevista !== undefined && { horaInicioPrevista: horaInicio }),
        ...(dto.horaFimPrevista !== undefined && { horaFimPrevista: horaFim }),
        ...(dto.motoristaId !== undefined && { motoristaId }),
        ...(dto.veiculoId !== undefined && { veiculoId }),
        ...(dto.solicitadoPor !== undefined && { solicitadoPor: dto.solicitadoPor }),
        ...(dto.autorizadoPor !== undefined && { autorizadoPor: dto.autorizadoPor }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes ?? null }),
        ...(destinoMudou && {
          destinoLatitude: coordsDestinoNovas?.latitude ?? null,
          destinoLongitude: coordsDestinoNovas?.longitude ?? null,
          // Invalida a rota cacheada — buscarPorId vai recalcular no próximo GET.
          rotaGeometria: Prisma.JsonNull,
          rotaDistanciaKm: null,
          rotaDuracaoMin: null,
        }),
      },
      include: INCLUDE_RELACOES,
    });

    return this.mapearResposta(atualizada);
  }

  async iniciar(
    id: string,
    dto: IniciarViagemDto,
    usuario: UsuarioJwt,
  ): Promise<ViagemRespostaDto> {
    const viagem = await this.prisma.viagem.findFirst({
      where: { id, dataExclusao: null },
      include: INCLUDE_RELACOES,
    });

    if (!viagem) throw new NotFoundException('Viagem não encontrada');

    if (viagem.status !== 'CRIADA') {
      throw new BadRequestException(
        `Não é possível iniciar viagem com status "${viagem.status}". Apenas viagens com status CRIADA podem ser iniciadas.`,
      );
    }

    if (usuario.perfil === 'motorista' && viagem.motoristaId !== usuario.sub) {
      throw new ForbiddenException('Motorista só pode iniciar suas próprias viagens');
    }

    if (dto.odometroInicial < viagem.veiculo.odometroAtual) {
      throw new BadRequestException(
        `Odômetro inicial (${dto.odometroInicial} km) não pode ser menor que o odômetro atual do veículo (${viagem.veiculo.odometroAtual} km)`,
      );
    }

    const atualizada = await this.prisma.viagem.update({
      where: { id },
      data: {
        status: 'EM_ANDAMENTO',
        odometroInicial: dto.odometroInicial,
        dataHoraInicioReal: agoraBrasilia(),
      },
      include: INCLUDE_RELACOES,
    });

    return this.mapearResposta(atualizada);
  }

  async finalizar(
    id: string,
    dto: FinalizarViagemDto,
    usuario: UsuarioJwt,
  ): Promise<ViagemRespostaDto> {
    const viagem = await this.prisma.viagem.findFirst({
      where: { id, dataExclusao: null },
      include: INCLUDE_RELACOES,
    });

    if (!viagem) throw new NotFoundException('Viagem não encontrada');

    if (viagem.status !== 'EM_ANDAMENTO') {
      throw new BadRequestException(
        `Não é possível finalizar viagem com status "${viagem.status}". Apenas viagens EM_ANDAMENTO podem ser finalizadas.`,
      );
    }

    if (usuario.perfil === 'motorista' && viagem.motoristaId !== usuario.sub) {
      throw new ForbiddenException('Motorista só pode finalizar suas próprias viagens');
    }

    const odometroInicial = viagem.odometroInicial ?? 0;
    if (dto.odometroFinal <= odometroInicial) {
      throw new BadRequestException(
        `Odômetro final (${dto.odometroFinal} km) deve ser maior que o odômetro inicial (${odometroInicial} km)`,
      );
    }

    const distanciaPercorrida = dto.odometroFinal - odometroInicial;

    const [atualizada] = await this.prisma.$transaction([
      this.prisma.viagem.update({
        where: { id },
        data: {
          status: 'FINALIZADA',
          odometroFinal: dto.odometroFinal,
          distanciaPercorrida,
          dataHoraFimReal: agoraBrasilia(),
        },
        include: INCLUDE_RELACOES,
      }),
      this.prisma.veiculo.update({
        where: { id: viagem.veiculoId },
        data: { odometroAtual: dto.odometroFinal },
      }),
    ]);

    // Esta viagem agora entra no cálculo de velocidade média — invalida o
    // cache do motorista pra recálculo na próxima leitura
    this.velocidade.invalidar(viagem.motoristaId);

    return this.mapearResposta(atualizada);
  }

  private mapearResposta(
    viagem: ViagemComRelacoes,
    velocidadeMediaKmH: number | null = null,
  ): ViagemRespostaDto {
    return {
      id: viagem.id,
      origem: viagem.origem,
      destino: viagem.destino,
      origemLatitude: viagem.origemLatitude != null ? Number(viagem.origemLatitude) : null,
      origemLongitude: viagem.origemLongitude != null ? Number(viagem.origemLongitude) : null,
      destinoLatitude: viagem.destinoLatitude != null ? Number(viagem.destinoLatitude) : null,
      destinoLongitude: viagem.destinoLongitude != null ? Number(viagem.destinoLongitude) : null,
      rotaGeometria: viagem.rotaGeometria,
      rotaDistanciaKm: viagem.rotaDistanciaKm != null ? Number(viagem.rotaDistanciaKm) : null,
      rotaDuracaoMin: viagem.rotaDuracaoMin,
      velocidadeMediaKmH,
      dataViagem: viagem.dataViagem.toISOString().split('T')[0] ?? '',
      horaInicioPrevista: dateParaHora(viagem.horaInicioPrevista),
      horaFimPrevista: dateParaHora(viagem.horaFimPrevista),
      dataHoraInicioReal: viagem.dataHoraInicioReal
        ? formatarDataHoraBrasilia(viagem.dataHoraInicioReal)
        : null,
      dataHoraFimReal: viagem.dataHoraFimReal
        ? formatarDataHoraBrasilia(viagem.dataHoraFimReal)
        : null,
      odometroInicial: viagem.odometroInicial,
      odometroFinal: viagem.odometroFinal,
      distanciaPercorrida: viagem.distanciaPercorrida,
      motoristaId: viagem.motoristaId,
      motorista: viagem.motorista,
      veiculoId: viagem.veiculoId,
      veiculo: {
        id: viagem.veiculo.id,
        placa: viagem.veiculo.placa,
        marca: viagem.veiculo.marca,
        modelo: viagem.veiculo.modelo,
        odometroAtual: viagem.veiculo.odometroAtual,
      },
      operadorCriadorId: viagem.operadorCriadorId,
      solicitadoPor: viagem.solicitadoPor,
      autorizadoPor: viagem.autorizadoPor,
      observacoes: viagem.observacoes,
      status: viagem.status as StatusViagem,
      dataCriacao: formatarDataHoraBrasilia(viagem.dataCriacao),
    };
  }
}
