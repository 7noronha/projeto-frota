import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export type SeveridadeAlerta = 'alto' | 'medio' | 'baixo';

export type TipoAlerta =
  | 'cnh_vencida'
  | 'cnh_vencendo'
  | 'viagem_atrasada'
  | 'viagem_sem_inicio'
  | 'multa_vencida'
  | 'multa_vencendo'
  | 'manutencao_devida'
  | 'seguro_vencido'
  | 'seguro_vencendo';

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  severidade: SeveridadeAlerta;
  titulo: string;
  descricao: string;
  alvoId: number;
  alvoTipo: 'motorista' | 'viagem' | 'veiculo' | 'multa' | 'seguro';
  href?: string;
}

// Intervalo padrão entre manutenções preventivas (km)
const INTERVALO_MANUTENCAO_KM = 10_000;

@Injectable()
export class AlertasService {
  constructor(private readonly prisma: PrismaService) {}

  private cachePerfilMotoristaId: number | null = null;
  private cacheStatusViagem = new Map<string, number>();
  private cacheSituacaoVeiculo = new Map<string, number>();
  private cacheTipoManutencao = new Map<string, number>();

  private async perfilMotoristaId(): Promise<number> {
    if (this.cachePerfilMotoristaId !== null) return this.cachePerfilMotoristaId;
    const p = await this.prisma.perfis_usuario.findUnique({ where: { nome: 'motorista' } });
    if (!p) throw new Error('perfil "motorista" não encontrado');
    this.cachePerfilMotoristaId = p.id;
    return p.id;
  }

  private async statusViagemId(nome: string): Promise<number> {
    const cached = this.cacheStatusViagem.get(nome);
    if (cached !== undefined) return cached;
    const s = await this.prisma.status_viagem.findUnique({ where: { nome } });
    if (!s) throw new Error(`status_viagem "${nome}" não encontrado`);
    this.cacheStatusViagem.set(nome, s.id);
    return s.id;
  }

  private async situacaoVeiculoId(nome: string): Promise<number> {
    const cached = this.cacheSituacaoVeiculo.get(nome);
    if (cached !== undefined) return cached;
    const s = await this.prisma.situacoes_veiculo.findUnique({ where: { nome } });
    if (!s) throw new Error(`situacao_veiculo "${nome}" não encontrada`);
    this.cacheSituacaoVeiculo.set(nome, s.id);
    return s.id;
  }

  private async tipoManutencaoId(nome: string): Promise<number | null> {
    const cached = this.cacheTipoManutencao.get(nome);
    if (cached !== undefined) return cached;
    const t = await this.prisma.tipos_manutencao.findUnique({ where: { nome } });
    if (!t) return null;
    this.cacheTipoManutencao.set(nome, t.id);
    return t.id;
  }

  async listar(): Promise<Alerta[]> {
    const alertas: Alerta[] = [];

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const limite30 = new Date(hoje);
    limite30.setDate(limite30.getDate() + 30);

    // 1. Motoristas com CNH vencida ou vencendo em <= 30 dias
    const perfilMotoristaId = await this.perfilMotoristaId();
    const motoristas = await this.prisma.usuarios.findMany({
      where: {
        perfil_id: perfilMotoristaId,
        ativo: true,
        data_hora_exclusao: null,
        cnh_validade: { not: null, lte: limite30 },
      },
      orderBy: { cnh_validade: 'asc' },
    });

    for (const m of motoristas) {
      if (!m.cnh_validade) continue;
      const dataValidade = new Date(m.cnh_validade);
      dataValidade.setHours(0, 0, 0, 0);
      const dias = Math.ceil((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      const vencida = dias < 0;
      alertas.push({
        id: `cnh:${m.id}`,
        tipo: vencida ? 'cnh_vencida' : 'cnh_vencendo',
        severidade: vencida ? 'alto' : dias <= 7 ? 'medio' : 'baixo',
        titulo: vencida
          ? `CNH de ${m.nome} vencida há ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'dia' : 'dias'}`
          : dias === 0
            ? `CNH de ${m.nome} vence hoje`
            : `CNH de ${m.nome} vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}`,
        descricao: `Matrícula ${m.matricula} · CNH ${m.cnh ?? '—'}`,
        alvoId: m.id,
        alvoTipo: 'motorista',
        href: `/motoristas/${m.id}/editar`,
      });
    }

    // 2. Viagens EM_ANDAMENTO atrasadas
    const statusEmAndamentoId = await this.statusViagemId('EM_ANDAMENTO');
    const emAndamento = await this.prisma.viagens.findMany({
      where: { status_id: statusEmAndamentoId, data_hora_exclusao: null },
      include: {
        motorista: { select: { nome: true } },
        veiculo: { select: { placa: true } },
      },
    });

    const agora = new Date();
    for (const v of emAndamento) {
      const fim = new Date(v.data_viagem);
      fim.setUTCHours(v.hora_fim_prevista.getUTCHours(), v.hora_fim_prevista.getUTCMinutes(), 0, 0);
      const fimEpoch = fim.getTime() + 3 * 60 * 60 * 1000;
      const minutosAtraso = Math.floor((agora.getTime() - fimEpoch) / 60_000);
      if (minutosAtraso <= 0) continue;

      alertas.push({
        id: `atrasada:${v.id}`,
        tipo: 'viagem_atrasada',
        severidade: minutosAtraso > 120 ? 'alto' : minutosAtraso > 30 ? 'medio' : 'baixo',
        titulo: `Viagem atrasada há ${
          minutosAtraso >= 60
            ? `${Math.floor(minutosAtraso / 60)}h${minutosAtraso % 60 > 0 ? ` ${minutosAtraso % 60}min` : ''}`
            : `${minutosAtraso}min`
        }`,
        descricao: `${v.motorista.nome} · ${v.veiculo.placa} · ${v.destino}`,
        alvoId: v.id,
        alvoTipo: 'viagem',
        href: `/viagens/${v.id}`,
      });
    }

    // 3. Viagens CRIADA cuja data_viagem já passou
    const statusCriadaId = await this.statusViagemId('CRIADA');
    const criadasVencidas = await this.prisma.viagens.findMany({
      where: {
        status_id: statusCriadaId,
        data_hora_exclusao: null,
        data_viagem: { lt: hoje },
      },
      include: {
        motorista: { select: { nome: true } },
        veiculo: { select: { placa: true } },
      },
      orderBy: { data_viagem: 'asc' },
    });

    for (const v of criadasVencidas) {
      const diasAtraso = Math.floor((hoje.getTime() - v.data_viagem.getTime()) / (1000 * 60 * 60 * 24));
      alertas.push({
        id: `naoiniciada:${v.id}`,
        tipo: 'viagem_sem_inicio',
        severidade: diasAtraso > 2 ? 'alto' : 'medio',
        titulo: `Viagem não iniciada há ${diasAtraso} ${diasAtraso === 1 ? 'dia' : 'dias'}`,
        descricao: `${v.motorista.nome} · ${v.veiculo.placa} · ${v.destino}`,
        alvoId: v.id,
        alvoTipo: 'viagem',
        href: `/viagens/${v.id}`,
      });
    }

    // 4. Multas com data_vencimento <= hoje + 7 dias (vencendo) ou < hoje (vencidas)
    const limite7Multas = new Date(hoje);
    limite7Multas.setDate(limite7Multas.getDate() + 7);

    const multas = await this.prisma.multas.findMany({
      where: {
        data_hora_exclusao: null,
        data_vencimento: { not: null, lte: limite7Multas },
      },
      include: {
        veiculo: { select: { placa: true, marca: true, modelo: true } },
      },
      orderBy: { data_vencimento: 'asc' },
    });

    for (const m of multas) {
      if (!m.data_vencimento) continue;
      const dataVenc = new Date(m.data_vencimento);
      dataVenc.setHours(0, 0, 0, 0);
      const dias = Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      const vencida = dias < 0;
      const valorFormatado = Number(m.valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      alertas.push({
        id: `multa:${m.id}`,
        tipo: vencida ? 'multa_vencida' : 'multa_vencendo',
        severidade: vencida ? 'alto' : dias <= 2 ? 'medio' : 'baixo',
        titulo: vencida
          ? `Multa vencida há ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'dia' : 'dias'}`
          : dias === 0
            ? 'Multa vence hoje'
            : `Multa vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}`,
        descricao: `${m.veiculo.placa} · ${m.descricao} · ${valorFormatado}${
          m.numero_auto ? ` · Auto ${m.numero_auto}` : ''
        }`,
        alvoId: m.id,
        alvoTipo: 'multa',
        href: `/veiculos/${m.veiculo_id}/multas/${m.id}/editar`,
      });
    }

    // 5. Seguros com vigencia_fim <= hoje + 30 dias
    const limite30Seguros = new Date(hoje);
    limite30Seguros.setDate(limite30Seguros.getDate() + 30);

    const seguros = await this.prisma.seguros.findMany({
      where: {
        data_hora_exclusao: null,
        vigencia_fim: { lte: limite30Seguros },
      },
      include: {
        veiculo: { select: { placa: true, marca: true, modelo: true } },
      },
      orderBy: { vigencia_fim: 'asc' },
    });

    // Mantém apenas o seguro mais recente por veículo
    const seguroMaisRecentePorVeiculo = new Map<number, (typeof seguros)[number]>();
    for (const s of seguros) {
      const existente = seguroMaisRecentePorVeiculo.get(s.veiculo_id);
      if (!existente || s.vigencia_fim > existente.vigencia_fim) {
        seguroMaisRecentePorVeiculo.set(s.veiculo_id, s);
      }
    }

    for (const s of seguroMaisRecentePorVeiculo.values()) {
      const fim = new Date(s.vigencia_fim);
      fim.setHours(0, 0, 0, 0);
      const dias = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      const vencido = dias < 0;

      alertas.push({
        id: `seguro:${s.id}`,
        tipo: vencido ? 'seguro_vencido' : 'seguro_vencendo',
        severidade: vencido ? 'alto' : dias <= 7 ? 'medio' : 'baixo',
        titulo: vencido
          ? `Seguro vencido há ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'dia' : 'dias'}`
          : dias === 0
            ? 'Seguro vence hoje'
            : `Seguro vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}`,
        descricao: `${s.veiculo.placa} · ${s.veiculo.marca} ${s.veiculo.modelo}${
          s.seguradora ? ` · ${s.seguradora}` : ''
        }${s.numero_apolice ? ` · Apólice ${s.numero_apolice}` : ''}`,
        alvoId: s.id,
        alvoTipo: 'seguro',
        href: `/veiculos/${s.veiculo_id}/seguros/${s.id}/editar`,
      });
    }

    // 6. Veículos com manutenção preventiva devida
    const situacaoAtivoId = await this.situacaoVeiculoId('ativo');
    const tipoPreventivaId = await this.tipoManutencaoId('preventiva');

    const veiculos = await this.prisma.veiculos.findMany({
      where: { situacao_id: situacaoAtivoId, data_hora_exclusao: null },
      select: { id: true, placa: true, marca: true, modelo: true, odometro_atual: true },
    });

    const preventivas =
      tipoPreventivaId === null
        ? []
        : await this.prisma.manutencoes.findMany({
            where: {
              tipo_manutencao_id: tipoPreventivaId,
              data_hora_exclusao: null,
              odometro: { not: null },
              veiculo_id: { in: veiculos.map((v) => v.id) },
            },
            select: { veiculo_id: true, odometro: true, data: true },
            orderBy: { data: 'desc' },
          });

    const ultimaPreventivaPorVeiculo = new Map<number, number>();
    for (const p of preventivas) {
      if (p.odometro != null && !ultimaPreventivaPorVeiculo.has(p.veiculo_id)) {
        ultimaPreventivaPorVeiculo.set(p.veiculo_id, p.odometro);
      }
    }

    for (const v of veiculos) {
      const odometroUltima = ultimaPreventivaPorVeiculo.get(v.id);
      if (odometroUltima == null) continue;

      const kmDesdeUltima = v.odometro_atual - odometroUltima;
      if (kmDesdeUltima < INTERVALO_MANUTENCAO_KM) continue;

      const excedente = kmDesdeUltima - INTERVALO_MANUTENCAO_KM;
      alertas.push({
        id: `manutencao:${v.id}`,
        tipo: 'manutencao_devida',
        severidade: excedente > 5_000 ? 'alto' : excedente > 1_000 ? 'medio' : 'baixo',
        titulo: `Manutenção preventiva devida há ${kmDesdeUltima.toLocaleString('pt-BR')} km`,
        descricao: `${v.placa} · ${v.marca} ${v.modelo} · última preventiva em ${odometroUltima.toLocaleString('pt-BR')} km, atual ${v.odometro_atual.toLocaleString('pt-BR')} km`,
        alvoId: v.id,
        alvoTipo: 'veiculo',
        href: `/veiculos/${v.id}/manutencoes/nova`,
      });
    }

    const peso: Record<SeveridadeAlerta, number> = { alto: 0, medio: 1, baixo: 2 };
    return alertas.sort((a, b) => peso[a.severidade] - peso[b.severidade]);
  }
}
