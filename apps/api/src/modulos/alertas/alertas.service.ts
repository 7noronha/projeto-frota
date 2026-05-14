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
  alvoId: string;
  alvoTipo: 'motorista' | 'viagem' | 'veiculo' | 'despesa';
  href?: string;
}

// Intervalo padrão entre manutenções preventivas (km)
const INTERVALO_MANUTENCAO_KM = 10_000;

@Injectable()
export class AlertasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Coleta alertas para o operador:
   * - CNHs vencidas e vencendo em ≤ 30 dias
   * - Viagens EM_ANDAMENTO que passaram da hora fim prevista (atrasadas)
   * - Viagens CRIADA cuja data já passou (não iniciadas a tempo)
   */
  async listar(): Promise<Alerta[]> {
    const alertas: Alerta[] = [];

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const limite30 = new Date(hoje);
    limite30.setDate(limite30.getDate() + 30);

    // 1. Motoristas com CNH vencida ou vencendo em <= 30 dias
    const motoristas = await this.prisma.usuario.findMany({
      where: {
        perfil: 'motorista',
        ativo: true,
        dataExclusao: null,
        cnhValidade: { not: null, lte: limite30 },
      },
      orderBy: { cnhValidade: 'asc' },
    });

    for (const m of motoristas) {
      if (!m.cnhValidade) continue;
      const dataValidade = new Date(m.cnhValidade);
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

    // 2. Viagens EM_ANDAMENTO atrasadas (passou da hora fim prevista)
    const emAndamento = await this.prisma.viagem.findMany({
      where: { status: 'EM_ANDAMENTO', dataExclusao: null },
      include: {
        motorista: { select: { nome: true } },
        veiculo: { select: { placa: true } },
      },
    });

    const agora = new Date();
    for (const v of emAndamento) {
      // Combina dataViagem (Date) + horaFimPrevista (Date com tempo em UTC) em America/Sao_Paulo
      const fim = new Date(v.dataViagem);
      fim.setUTCHours(v.horaFimPrevista.getUTCHours(), v.horaFimPrevista.getUTCMinutes(), 0, 0);
      // Ajuste de fuso: dataViagem é DATE puro; consideramos hora em Brasília (UTC-3)
      // fim em UTC equivale a fim + 3h em America/Sao_Paulo no momento do cálculo
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

    // 3. Viagens CRIADA cuja dataViagem já passou (não iniciadas no dia)
    const criadasVencidas = await this.prisma.viagem.findMany({
      where: {
        status: 'CRIADA',
        dataExclusao: null,
        dataViagem: { lt: hoje },
      },
      include: {
        motorista: { select: { nome: true } },
        veiculo: { select: { placa: true } },
      },
      orderBy: { dataViagem: 'asc' },
    });

    for (const v of criadasVencidas) {
      const diasAtraso = Math.floor((hoje.getTime() - v.dataViagem.getTime()) / (1000 * 60 * 60 * 24));
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

    // 4. Multas com dataVencimento ≤ hoje + 7 dias (vencendo) ou < hoje (vencidas)
    const limite7Multas = new Date(hoje);
    limite7Multas.setDate(limite7Multas.getDate() + 7);

    const multas = await this.prisma.despesaVeiculo.findMany({
      where: {
        tipo: 'multa',
        dataExclusao: null,
        dataVencimento: { not: null, lte: limite7Multas },
      },
      include: {
        veiculo: { select: { placa: true, marca: true, modelo: true } },
      },
      orderBy: { dataVencimento: 'asc' },
    });

    for (const m of multas) {
      if (!m.dataVencimento) continue;
      const dataVenc = new Date(m.dataVencimento);
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
          m.numeroAuto ? ` · Auto ${m.numeroAuto}` : ''
        }`,
        alvoId: m.id,
        alvoTipo: 'despesa',
        href: `/veiculos/${m.veiculoId}/despesas/${m.id}/editar`,
      });
    }

    // 5. Seguros com vigenciaFim ≤ hoje + 30 dias (vencendo) ou < hoje (vencidos)
    const limite30Seguros = new Date(hoje);
    limite30Seguros.setDate(limite30Seguros.getDate() + 30);

    const seguros = await this.prisma.despesaVeiculo.findMany({
      where: {
        tipo: 'seguro',
        dataExclusao: null,
        vigenciaFim: { not: null, lte: limite30Seguros },
      },
      include: {
        veiculo: { select: { placa: true, marca: true, modelo: true } },
      },
      orderBy: { vigenciaFim: 'asc' },
    });

    // Mantém apenas o seguro mais recente por veículo (evita ruído quando há
    // várias apólices antigas registradas)
    const seguroMaisRecentePorVeiculo = new Map<string, (typeof seguros)[number]>();
    for (const s of seguros) {
      const existente = seguroMaisRecentePorVeiculo.get(s.veiculoId);
      if (!existente || (s.vigenciaFim && existente.vigenciaFim && s.vigenciaFim > existente.vigenciaFim)) {
        seguroMaisRecentePorVeiculo.set(s.veiculoId, s);
      }
    }

    for (const s of seguroMaisRecentePorVeiculo.values()) {
      if (!s.vigenciaFim) continue;
      const fim = new Date(s.vigenciaFim);
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
        }${s.numeroApolice ? ` · Apólice ${s.numeroApolice}` : ''}`,
        alvoId: s.id,
        alvoTipo: 'despesa',
        href: `/veiculos/${s.veiculoId}/despesas/${s.id}/editar`,
      });
    }

    // 6. Veículos com manutenção devida (km desde a última preventiva > intervalo padrão)
    const veiculos = await this.prisma.veiculo.findMany({
      where: { situacao: 'ativo', dataExclusao: null },
      select: { id: true, placa: true, marca: true, modelo: true, odometroAtual: true },
    });

    for (const v of veiculos) {
      const ultimaPreventiva = await this.prisma.despesaVeiculo.findFirst({
        where: {
          veiculoId: v.id,
          tipo: 'manutencao',
          tipoManutencao: 'preventiva',
          dataExclusao: null,
          odometro: { not: null },
        },
        orderBy: { data: 'desc' },
      });

      // Sem histórico de preventiva: considera o odometroAtual como referência
      // (sem alerta — operador é quem decide cadastrar a primeira)
      if (!ultimaPreventiva?.odometro) continue;

      const kmDesdeUltima = v.odometroAtual - ultimaPreventiva.odometro;
      if (kmDesdeUltima < INTERVALO_MANUTENCAO_KM) continue;

      const excedente = kmDesdeUltima - INTERVALO_MANUTENCAO_KM;
      alertas.push({
        id: `manutencao:${v.id}`,
        tipo: 'manutencao_devida',
        severidade: excedente > 5_000 ? 'alto' : excedente > 1_000 ? 'medio' : 'baixo',
        titulo: `Manutenção preventiva devida há ${kmDesdeUltima.toLocaleString('pt-BR')} km`,
        descricao: `${v.placa} · ${v.marca} ${v.modelo} · última preventiva em ${ultimaPreventiva.odometro.toLocaleString('pt-BR')} km, atual ${v.odometroAtual.toLocaleString('pt-BR')} km`,
        alvoId: v.id,
        alvoTipo: 'veiculo',
        href: `/veiculos/${v.id}/despesas/nova`,
      });
    }

    // Ordena por severidade (alto > medio > baixo) e mantém estável dentro
    const peso: Record<SeveridadeAlerta, number> = { alto: 0, medio: 1, baixo: 2 };
    return alertas.sort((a, b) => peso[a.severidade] - peso[b.severidade]);
  }
}
