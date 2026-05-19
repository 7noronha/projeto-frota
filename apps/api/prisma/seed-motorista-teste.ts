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

  const veiculo2 = await prisma.veiculo.upsert({
    where: { placa: 'TST2B34' },
    update: { situacao: 'ativo' },
    create: {
      placa: 'TST2B34',
      marca: 'VOLKSWAGEN',
      modelo: 'SAVEIRO',
      anoFabricacao: 2023,
      anoModelo: 2024,
      cor: 'PRATA',
      renavam: '11223344556',
      odometroAtual: 42000,
      dataAquisicao: dataDia(-600),
      situacao: 'ativo',
      observacoes: 'VEÍCULO DE TESTE 2 — SEED MOTORISTA',
    },
  });
  console.log(`Veículo de teste 2: ${veiculo2.placa}`);

  const base = {
    origem: 'SEDE — GOIÂNIA, GO',
    motoristaId: motorista.id,
    operadorCriadorId: admin.id,
    solicitadoPor: 'João da Silva (RH)',
    autorizadoPor: 'Maria Souza (Gerência)',
    observacoes: null as string | null,
  };

  // Viagens do veículo 1 — idempotente por motorista+veículo
  const temV1 = await prisma.viagem.count({
    where: { motoristaId: motorista.id, veiculoId: veiculo.id, dataExclusao: null },
  });
  if (temV1 === 0) {
    await prisma.viagem.create({
      data: {
        ...base,
        veiculoId: veiculo.id,
        destino: 'AEROPORTO SANTA GENOVEVA — GOIÂNIA, GO',
        dataViagem: dataDia(0),
        horaInicioPrevista: hora(14),
        horaFimPrevista: hora(18),
        status: 'CRIADA',
      },
    });
    await prisma.viagem.create({
      data: {
        ...base,
        veiculoId: veiculo.id,
        destino: 'CENTRO ADMINISTRATIVO — GOIÂNIA, GO',
        dataViagem: dataDia(0),
        horaInicioPrevista: hora(8),
        horaFimPrevista: hora(12),
        status: 'EM_ANDAMENTO',
        dataHoraInicioReal: new Date(),
        odometroInicial: veiculo.odometroAtual,
      },
    });
    await prisma.viagem.create({
      data: {
        ...base,
        veiculoId: veiculo.id,
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
    console.log('Veículo 1: 3 viagens criadas (CRIADA, EM_ANDAMENTO, FINALIZADA).');
  } else {
    console.log(`Veículo 1 já tem ${temV1} viagem(ns) — pulado.`);
  }

  // Viagem do veículo 2 — para o motorista ter 2 placas selecionáveis
  const temV2 = await prisma.viagem.count({
    where: { motoristaId: motorista.id, veiculoId: veiculo2.id, dataExclusao: null },
  });
  if (temV2 === 0) {
    await prisma.viagem.create({
      data: {
        ...base,
        veiculoId: veiculo2.id,
        destino: 'TERMINAL RODOVIÁRIO — APARECIDA DE GOIÂNIA, GO',
        dataViagem: dataDia(1),
        horaInicioPrevista: hora(7),
        horaFimPrevista: hora(11),
        status: 'CRIADA',
      },
    });
    console.log('Veículo 2: 1 viagem criada.');
  } else {
    console.log(`Veículo 2 já tem ${temV2} viagem(ns) — pulado.`);
  }

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
