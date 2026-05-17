/**
 * Seed de TESTE — cria 1 motorista de teste + 1 veículo + 3 viagens
 * (CRIADA, EM_ANDAMENTO, FINALIZADA) atribuídas a ele, para exercitar
 * o fluxo no app mobile.
 *
 * Uso: cd apps/api && bunx tsx prisma/seed-motorista-teste.ts
 *
 * Idempotente: usa upsert por matrícula/placa e só cria viagens se o
 * motorista de teste ainda não tiver nenhuma.
 *
 * Credenciais geradas:
 *   matrícula: 0000001234
 *   senha:     12341234
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const MATRICULA_MOTORISTA = '0000001234';
const SENHA_MOTORISTA = '12341234';

function dataDia(deltaDias: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + deltaDias);
  d.setHours(0, 0, 0, 0);
  return d;
}

function hora(h: number): Date {
  return new Date(Date.UTC(1970, 0, 1, h, 0, 0));
}

async function main(): Promise<void> {
  const admin = await prisma.usuario.findUnique({
    where: { matricula: '0000000001' },
  });
  if (!admin) {
    throw new Error(
      'Usuário admin (0000000001) não encontrado. Rode o seed base antes (npx prisma db seed).',
    );
  }

  const senhaHash = await bcrypt.hash(SENHA_MOTORISTA, 10);
  const validadeCnh = dataDia(365 * 3); // CNH válida por ~3 anos

  const motorista = await prisma.usuario.upsert({
    where: { matricula: MATRICULA_MOTORISTA },
    update: { senhaHash, perfil: 'motorista', ativo: true, cnhValidade: validadeCnh },
    create: {
      matricula: MATRICULA_MOTORISTA,
      nome: 'Motorista Teste',
      senhaHash,
      perfil: 'motorista',
      email: 'motorista.teste@fleetops.local',
      telefone: '62999990000',
      cnh: '12345678901',
      cnhValidade: validadeCnh,
      ativo: true,
    },
  });
  console.log(`Motorista de teste: ${motorista.matricula} (${motorista.nome})`);

  const veiculo = await prisma.veiculo.upsert({
    where: { placa: 'TST1A23' },
    update: { situacao: 'ativo' },
    create: {
      placa: 'TST1A23',
      marca: 'CHEVROLET',
      modelo: 'ONIX',
      anoFabricacao: 2024,
      anoModelo: 2025,
      cor: 'BRANCO',
      renavam: '99887766554',
      odometroAtual: 15000,
      dataAquisicao: dataDia(-400),
      situacao: 'ativo',
      observacoes: 'VEÍCULO DE TESTE — SEED MOTORISTA',
    },
  });
  console.log(`Veículo de teste: ${veiculo.placa}`);

  const viagensExistentes = await prisma.viagem.count({
    where: { motoristaId: motorista.id, dataExclusao: null },
  });
  if (viagensExistentes > 0) {
    console.log(
      `Motorista já tem ${viagensExistentes} viagem(ns) — pulando criação de viagens.`,
    );
    return;
  }

  const base = {
    origem: 'SEDE — GOIÂNIA, GO',
    motoristaId: motorista.id,
    veiculoId: veiculo.id,
    operadorCriadorId: admin.id,
    solicitadoPor: 'João da Silva (RH)',
    autorizadoPor: 'Maria Souza (Gerência)',
    observacoes: null as string | null,
  };

  // 1 CRIADA (testar "iniciar")
  await prisma.viagem.create({
    data: {
      ...base,
      destino: 'AEROPORTO SANTA GENOVEVA — GOIÂNIA, GO',
      dataViagem: dataDia(0),
      horaInicioPrevista: hora(14),
      horaFimPrevista: hora(18),
      status: 'CRIADA',
    },
  });

  // 1 EM_ANDAMENTO (testar "finalizar")
  await prisma.viagem.create({
    data: {
      ...base,
      destino: 'CENTRO ADMINISTRATIVO — GOIÂNIA, GO',
      dataViagem: dataDia(0),
      horaInicioPrevista: hora(8),
      horaFimPrevista: hora(12),
      status: 'EM_ANDAMENTO',
      dataHoraInicioReal: new Date(),
      odometroInicial: veiculo.odometroAtual,
    },
  });

  // 1 FINALIZADA (visão de concluída)
  await prisma.viagem.create({
    data: {
      ...base,
      destino: 'PORTO SECO — ANÁPOLIS, GO',
      dataViagem: dataDia(-1),
      horaInicioPrevista: hora(9),
      horaFimPrevista: hora(15),
      status: 'FINALIZADA',
      dataHoraInicioReal: new Date(),
      dataHoraFimReal: new Date(),
      odometroInicial: veiculo.odometroAtual - 300,
      odometroFinal: veiculo.odometroAtual,
      distanciaPercorrida: 300,
    },
  });

  console.log('3 viagens criadas (CRIADA, EM_ANDAMENTO, FINALIZADA).');
  console.log('\nLogin no app:  matrícula 0000001234  /  senha 12341234');
}

main()
  .catch((erro) => {
    console.error('Erro no seed do motorista de teste:', erro);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
