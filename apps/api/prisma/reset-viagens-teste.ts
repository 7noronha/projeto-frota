/**
 * Reset de viagens de TESTE (uso pontual).
 *
 * 1. Soft delete de TODAS as viagens existentes (data_hora_exclusao = agora).
 *    Nunca apaga fisicamente — segue a regra de exclusão lógica do projeto.
 * 2. Recria viagens para o motorista de teste (0000001234) com destinos reais
 *    da região da SEDE (SP-075, km ~46, Salto/SP) e distâncias <= 20 km.
 *
 * Uso (definindo a connection string da vez):
 *   DATABASE_URL="postgresql://..." bunx tsx prisma/reset-viagens-teste.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function dia(deltaDias: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + deltaDias);
  return d;
}

function hora(h: number): Date {
  return new Date(Date.UTC(1970, 0, 1, h, 0, 0));
}

async function main(): Promise<void> {
  const [motorista, admin, situacaoAtivo, statusCriada, statusEmAndamento, statusFinalizada, sedeCfg] =
    await Promise.all([
      prisma.usuarios.findUnique({ where: { matricula: '0000001234' } }),
      prisma.usuarios.findUnique({ where: { matricula: '0000000001' } }),
      prisma.situacoes_veiculo.findUnique({ where: { nome: 'ativo' } }),
      prisma.status_viagem.findUnique({ where: { nome: 'CRIADA' } }),
      prisma.status_viagem.findUnique({ where: { nome: 'EM_ANDAMENTO' } }),
      prisma.status_viagem.findUnique({ where: { nome: 'FINALIZADA' } }),
      prisma.configuracoes.findFirst({ where: { chave: 'endereco_sede' } }),
    ]);

  if (!motorista || !admin || !situacaoAtivo || !statusCriada || !statusEmAndamento || !statusFinalizada) {
    throw new Error('Pré-requisitos ausentes (motorista 0000001234 / admin / lookups). Rode os seeds base.');
  }

  const origem = sedeCfg?.valor ?? 'SEDE NÃO CONFIGURADA';
  console.log(`SEDE (origem): ${origem}`);

  // Veículo de teste do motorista (Onix). Garante existência e situação ativa.
  const veiculo = await prisma.veiculos.upsert({
    where: { placa: 'TST1A23' },
    update: { situacao_id: situacaoAtivo.id },
    create: {
      placa: 'TST1A23',
      marca: 'CHEVROLET',
      modelo: 'ONIX',
      ano_fabricacao: 2024,
      ano_modelo: 2025,
      cor: 'BRANCO',
      renavam: '99887766554',
      odometro_atual: 15000,
      data_aquisicao: dia(-400),
      situacao_id: situacaoAtivo.id,
      observacoes: 'VEÍCULO DE TESTE — RESET',
    },
  });

  // 1) Soft delete de todas as viagens ativas.
  const agora = new Date();
  const apagadas = await prisma.viagens.updateMany({
    where: { data_hora_exclusao: null },
    data: { data_hora_exclusao: agora },
  });
  console.log(`Soft delete: ${apagadas.count} viagem(ns) antiga(s) marcada(s) como excluída(s).`);

  const base = {
    origem,
    motorista_id: motorista.id,
    veiculo_id: veiculo.id,
    operador_criador_id: admin.id,
    solicitado_por: 'João da Silva (RH)',
    autorizado_por: 'Maria Souza (Gerência)',
    observacoes: null as string | null,
  };

  // Odômetro inicial da sequência (parte do valor atual do veículo).
  let odo = veiculo.odometro_atual;

  // 2) Viagens FINALIZADAS — distâncias <= 20 km, região da SEDE (Salto/SP).
  const finalizadas: Array<{ destino: string; dist: number; diaDelta: number; hi: number; hf: number }> = [
    { destino: 'Indaiatuba, SP', dist: 6, diaDelta: -3, hi: 8, hf: 10 },
    { destino: 'Helvetia, Indaiatuba, SP', dist: 13, diaDelta: -2, hi: 9, hf: 12 },
    { destino: 'Salto, SP', dist: 17, diaDelta: -1, hi: 13, hf: 16 },
  ];
  for (const f of finalizadas) {
    const ini = odo;
    const fim = odo + f.dist;
    odo = fim;
    await prisma.viagens.create({
      data: {
        ...base,
        destino: f.destino,
        data_viagem: dia(f.diaDelta),
        hora_inicio_prevista: hora(f.hi),
        hora_fim_prevista: hora(f.hf),
        status_id: statusFinalizada.id,
        data_hora_inicio_real: agora,
        data_hora_fim_real: agora,
        odometro_inicial: ini,
        odometro_final: fim,
        distancia_percorrida: f.dist,
      },
    });
    console.log(`FINALIZADA  ${f.dist} km  → ${f.destino}`);
  }

  // 3) Viagem EM_ANDAMENTO — iniciada, sem fim.
  const destinoEmAndamento = 'Itaici, Indaiatuba, SP';
  const emAndamento = await prisma.viagens.create({
    data: {
      ...base,
      destino: destinoEmAndamento,
      data_viagem: dia(0),
      hora_inicio_prevista: hora(8),
      hora_fim_prevista: hora(11),
      status_id: statusEmAndamento.id,
      data_hora_inicio_real: agora,
      odometro_inicial: odo,
    },
  });
  console.log(`EM_ANDAMENTO (odo ${odo}) → ${destinoEmAndamento}`);

  // Posições GPS de exemplo no trecho SEDE (SP-75) → Indaiatuba.
  await prisma.posicoes_viagem.createMany({
    data: [
      { viagem_id: emAndamento.id, latitude: -23.115, longitude: -47.226, capturado_em: agora },
      { viagem_id: emAndamento.id, latitude: -23.105, longitude: -47.22, capturado_em: agora },
    ],
  });

  // 4) Viagens CRIADAS — agendadas (uma hoje, uma amanhã).
  const criadas: Array<{ destino: string; diaDelta: number; hi: number; hf: number }> = [
    { destino: 'Distrito Industrial João Narezzi, Indaiatuba, SP', diaDelta: 0, hi: 15, hf: 17 },
    { destino: 'Polo Shopping Indaiatuba, SP', diaDelta: 1, hi: 7, hf: 9 },
  ];
  for (const c of criadas) {
    await prisma.viagens.create({
      data: {
        ...base,
        destino: c.destino,
        data_viagem: dia(c.diaDelta),
        hora_inicio_prevista: hora(c.hi),
        hora_fim_prevista: hora(c.hf),
        status_id: statusCriada.id,
      },
    });
    console.log(`CRIADA       → ${c.destino}`);
  }

  // Atualiza o odômetro do veículo para o último valor coerente.
  await prisma.veiculos.update({ where: { id: veiculo.id }, data: { odometro_atual: odo } });
  console.log(`Veículo ${veiculo.placa}: odômetro atualizado para ${odo} km.`);

  console.log('\nReset concluído. Login no app: 0000001234 / 12341234');
}

main()
  .catch((erro) => {
    console.error('Erro no reset de viagens:', erro);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
