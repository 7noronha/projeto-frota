/**
 * Seed de demonstração: garante ao menos 1 registro de cada tabela de despesa
 * para CADA veículo ativo (abastecimento, documentação, imposto, manutenção,
 * multa, seguro). Idempotente: se o veículo já tem registro (não excluído)
 * naquela tabela, pula.
 *
 * Uso (prod):
 *   cd apps/api && DATABASE_URL="..." bunx tsx prisma/seed-despesas-demo.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Data (somente dia) deslocada em N dias a partir de hoje, no fuso local. */
function dia(offsetDias: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDias);
  return d;
}

async function primeiroId(model: { findFirst: (a: unknown) => Promise<{ id: number } | null> }, nome?: string) {
  const reg = nome
    ? await (model as any).findFirst({ where: { nome } })
    : await (model as any).findFirst({ orderBy: { id: 'asc' } });
  const fallback = await (model as any).findFirst({ orderBy: { id: 'asc' } });
  return (reg ?? fallback)?.id as number;
}

async function temRegistro(model: { count: (a: unknown) => Promise<number> }, veiculoId: number): Promise<boolean> {
  const c = await (model as any).count({ where: { veiculo_id: veiculoId, data_hora_exclusao: null } });
  return c > 0;
}

async function main(): Promise<void> {
  const veiculos = await prisma.veiculos.findMany({
    where: { data_hora_exclusao: null },
    select: { id: true, placa: true, odometro_atual: true },
    orderBy: { id: 'asc' },
  });
  if (veiculos.length === 0) {
    console.log('Nenhum veículo ativo encontrado. Nada a fazer.');
    return;
  }

  const combustivelId = await primeiroId(prisma.tipos_combustivel as never);
  const documentoId = await primeiroId(prisma.tipos_documento_veiculo as never);
  const impostoTipoId = await primeiroId(prisma.tipos_imposto as never);
  const manutencaoTipoId = await primeiroId(prisma.tipos_manutencao as never);
  const gravidadeId = await primeiroId(prisma.gravidades_multa as never, 'leve');
  const coberturaId = await primeiroId(prisma.tipos_cobertura_seguro as never);

  const ano = new Date().getFullYear();
  let total = 0;

  for (let i = 0; i < veiculos.length; i++) {
    const v = veiculos[i]!;
    const odo = v.odometro_atual ?? 50000;
    const criados: string[] = [];

    if (!(await temRegistro(prisma.abastecimentos as never, v.id))) {
      const litros = 42 + i;
      const preco = 5.79;
      await prisma.abastecimentos.create({
        data: {
          veiculo_id: v.id,
          tipo_combustivel_id: combustivelId,
          data: dia(-5),
          litros,
          preco_litro: preco,
          valor: Number((litros * preco).toFixed(2)),
          odometro: odo,
          descricao: 'Abastecimento — posto credenciado',
        },
      });
      criados.push('abastecimento');
    }

    if (!(await temRegistro(prisma.documentacoes as never, v.id))) {
      await prisma.documentacoes.create({
        data: {
          veiculo_id: v.id,
          tipo_documento_veiculo_id: documentoId,
          data: dia(-30),
          valor: 178.5,
          data_vencimento: dia(120),
          descricao: 'Licenciamento anual do veículo',
        },
      });
      criados.push('documentacao');
    }

    if (!(await temRegistro(prisma.impostos as never, v.id))) {
      await prisma.impostos.create({
        data: {
          veiculo_id: v.id,
          tipo_imposto_id: impostoTipoId,
          data: dia(-60),
          valor: 1240.0,
          ano_exercicio: ano,
          numero_parcela: 1,
          total_parcelas: 3,
          data_vencimento: dia(15),
          descricao: `IPVA ${ano} — 1ª parcela`,
        },
      });
      criados.push('imposto');
    }

    if (!(await temRegistro(prisma.manutencoes as never, v.id))) {
      await prisma.manutencoes.create({
        data: {
          veiculo_id: v.id,
          tipo_manutencao_id: manutencaoTipoId,
          data: dia(-12),
          valor: 389.9,
          oficina: 'Auto Center Central',
          odometro: odo,
          descricao: 'Troca de óleo, filtros e revisão preventiva',
        },
      });
      criados.push('manutencao');
    }

    if (!(await temRegistro(prisma.multas as never, v.id))) {
      await prisma.multas.create({
        data: {
          veiculo_id: v.id,
          gravidade_multa_id: gravidadeId,
          data: dia(-20),
          valor: 130.16,
          numero_auto: `AI-${ano}-${String(1000 + v.id)}`,
          pontos_cnh: 4,
          data_vencimento: dia(25),
          descricao: 'Avanço de tempo em via — excesso de velocidade até 20%',
        },
      });
      criados.push('multa');
    }

    if (!(await temRegistro(prisma.seguros as never, v.id))) {
      await prisma.seguros.create({
        data: {
          veiculo_id: v.id,
          tipo_cobertura_seguro_id: coberturaId,
          data: dia(-90),
          valor: 2480.0,
          seguradora: 'Seguradora Brasil',
          numero_apolice: `AP-${ano}-${String(5000 + v.id)}`,
          vigencia_inicio: dia(-90),
          vigencia_fim: dia(275),
          descricao: 'Seguro total do veículo (12 meses)',
        },
      });
      criados.push('seguro');
    }

    total += criados.length;
    console.log(`Veículo ${v.placa} (#${v.id}): ${criados.length ? criados.join(', ') : 'já tinha tudo'}`);
  }

  console.log(`\nConcluído. ${total} registro(s) criado(s) em ${veiculos.length} veículo(s).`);
}

main()
  .catch((e) => {
    console.error('Erro no seed de despesas:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
