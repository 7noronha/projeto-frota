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
import { IniciarViagemDto } from './dto/iniciar-viagem.dto';
import { FinalizarViagemDto } from './dto/finalizar-viagem.dto';
import { ViagemRespostaDto } from './dto/viagem-resposta.dto';
import { FiltrosListarViagensDto } from './dto/filtros-listar-viagens.dto';

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
  motorista: { id: string; nome: string; matricula: string };
  veiculo: { id: string; placa: string; marca: string; modelo: string; odometroAtual: number };
};

const INCLUDE_RELACOES = {
  motorista: { select: { id: true, nome: true, matricula: true } },
  veiculo: { select: { id: true, placa: true, marca: true, modelo: true, odometroAtual: true } },
} as const;

@Injectable()
export class ViagensService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros: FiltrosListarViagensDto,
    usuario: UsuarioJwt,
  ): Promise<RespostaPaginada<ViagemRespostaDto>> {
    const pagina = filtros.pagina ?? 1;
    const tamanhoPagina = filtros.tamanhoPagina ?? 20;
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
        skip: (pagina - 1) * tamanhoPagina,
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

    return this.mapearResposta(viagem);
  }

  async criar(dto: CriarViagemDto, operadorId: string): Promise<ViagemRespostaDto> {
    // 1. Endereço da sede
    const configSede = await this.prisma.configuracao.findFirst({
      where: { chave: 'endereco_sede' },
    });
    if (!configSede) {
      throw new BadRequestException('Endereço da sede não configurado no sistema');
    }

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

    // 6. Conflito de motorista (mesmo dia, viagem ativa)
    const conflitoMotorista = await this.prisma.viagem.findFirst({
      where: {
        motoristaId: dto.motoristaId,
        dataViagem,
        status: { in: ['CRIADA', 'EM_ANDAMENTO'] },
        dataExclusao: null,
      },
    });
    if (conflitoMotorista) {
      throw new BadRequestException(
        'Motorista já possui viagem ativa nesta data. Verifique o agendamento.',
      );
    }

    // 7. Conflito de veículo (mesmo dia, viagem ativa)
    const conflitoVeiculo = await this.prisma.viagem.findFirst({
      where: {
        veiculoId: dto.veiculoId,
        dataViagem,
        status: { in: ['CRIADA', 'EM_ANDAMENTO'] },
        dataExclusao: null,
      },
    });
    if (conflitoVeiculo) {
      throw new BadRequestException(
        'Veículo já possui viagem ativa nesta data. Verifique o agendamento.',
      );
    }

    const viagem = await this.prisma.viagem.create({
      data: {
        origem: configSede.valor,
        destino: dto.destino,
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

    return this.mapearResposta(viagem);
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

    return this.mapearResposta(atualizada);
  }

  private mapearResposta(viagem: ViagemComRelacoes): ViagemRespostaDto {
    return {
      id: viagem.id,
      origem: viagem.origem,
      destino: viagem.destino,
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
