import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export type SeveridadeAlerta = 'alto' | 'medio' | 'baixo';

export interface Alerta {
  id: string;
  tipo: 'cnh_vencida' | 'cnh_vencendo' | 'viagem_atrasada' | 'viagem_sem_inicio';
  severidade: SeveridadeAlerta;
  titulo: string;
  descricao: string;
  alvoId: string;
  alvoTipo: 'motorista' | 'viagem';
  href?: string;
}

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

    // Ordena por severidade (alto > medio > baixo) e mantém estável dentro
    const peso: Record<SeveridadeAlerta, number> = { alto: 0, medio: 1, baixo: 2 };
    return alertas.sort((a, b) => peso[a.severidade] - peso[b.severidade]);
  }
}
