/**
 * Seed de TESTE — cria 1 motorista de teste + 2 veículos + 4 viagens
 * (CRIADA, EM_ANDAMENTO, FINALIZADA + 1 extra no segundo veículo).
 *
 * Uso: cd apps/api && bunx tsx prisma/seed-motorista-teste.ts
 *
 * Credenciais:
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
  const admin = await prisma.usuarios.findUnique({
    where: { matricula: '0000000001' },
  });
  if (!admin) {
    throw new Error(
      'Usuário admin (0000000001) não encontrado. Rode o seed base antes (bunx prisma db seed).',
    );
  }

  const perfilMotorista = await prisma.perfis_usuario.findUnique({
    where: { nome: 'motorista' },
  });
  const situacaoAtivo = await prisma.situacoes_veiculo.findUnique({
    where: { nome: 'ativo' },
  });
  const statusCriada = await prisma.status_viagem.findUnique({ where: { nome: 'CRIADA' } });
  const statusEmAndamento = await prisma.status_viagem.findUnique({
    where: { nome: 'EM_ANDAMENTO' },
  });
  const statusFinalizada = await prisma.status_viagem.findUnique({
    where: { nome: 'FINALIZADA' },
  });

  if (!perfilMotorista || !situacaoAtivo || !statusCriada || !statusEmAndamento || !statusFinalizada) {
    throw new Error('Lookups base não encontrados — rode o seed principal primeiro.');
  }

  const senhaHash = await bcrypt.hash(SENHA_MOTORISTA, 10);
  const validadeCnh = dataDia(365 * 3);

  const motorista = await prisma.usuarios.upsert({
    where: { matricula: MATRICULA_MOTORISTA },
    update: {
      senha_hash: senhaHash,
      perfil_id: perfilMotorista.id,
      ativo: true,
      cnh_validade: validadeCnh,
    },
    create: {
      matricula: MATRICULA_MOTORISTA,
      nome: 'Motorista Teste',
      senha_hash: senhaHash,
      perfil_id: perfilMotorista.id,
      email: 'motorista.teste@fleetops.local',
      telefone: '62999990000',
      cnh: '12345678901',
      cnh_validade: validadeCnh,
      ativo: true,
    },
  });
  console.log(`Motorista de teste: ${motorista.matricula} (${motorista.nome})`);

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
      data_aquisicao: dataDia(-400),
      situacao_id: situacaoAtivo.id,
      observacoes: 'VEÍCULO DE TESTE — SEED MOTORISTA',
    },
  });
  console.log(`Veículo de teste: ${veiculo.placa}`);

  const veiculo2 = await prisma.veiculos.upsert({
    where: { placa: 'TST2B34' },
    update: { situacao_id: situacaoAtivo.id },
    create: {
      placa: 'TST2B34',
      marca: 'VOLKSWAGEN',
      modelo: 'SAVEIRO',
      ano_fabricacao: 2023,
      ano_modelo: 2024,
      cor: 'PRATA',
      renavam: '11223344556',
      odometro_atual: 42000,
      data_aquisicao: dataDia(-600),
      situacao_id: situacaoAtivo.id,
      observacoes: 'VEÍCULO DE TESTE 2 — SEED MOTORISTA',
    },
  });
  console.log(`Veículo de teste 2: ${veiculo2.placa}`);

  const base = {
    origem: 'SEDE — GOIÂNIA, GO',
    motorista_id: motorista.id,
    operador_criador_id: admin.id,
    solicitado_por: 'João da Silva (RH)',
    autorizado_por: 'Maria Souza (Gerência)',
    observacoes: null as string | null,
  };

  const temV1 = await prisma.viagens.count({
    where: { motorista_id: motorista.id, veiculo_id: veiculo.id, data_hora_exclusao: null },
  });
  if (temV1 === 0) {
    await prisma.viagens.create({
      data: {
        ...base,
        veiculo_id: veiculo.id,
        destino: 'AEROPORTO SANTA GENOVEVA — GOIÂNIA, GO',
        data_viagem: dataDia(0),
        hora_inicio_prevista: hora(14),
        hora_fim_prevista: hora(18),
        status_id: statusCriada.id,
      },
    });
    await prisma.viagens.create({
      data: {
        ...base,
        veiculo_id: veiculo.id,
        destino: 'CENTRO ADMINISTRATIVO — GOIÂNIA, GO',
        data_viagem: dataDia(0),
        hora_inicio_prevista: hora(8),
        hora_fim_prevista: hora(12),
        status_id: statusEmAndamento.id,
        data_hora_inicio_real: new Date(),
        odometro_inicial: veiculo.odometro_atual,
      },
    });
    await prisma.viagens.create({
      data: {
        ...base,
        veiculo_id: veiculo.id,
        destino: 'PORTO SECO — ANÁPOLIS, GO',
        data_viagem: dataDia(-1),
        hora_inicio_prevista: hora(9),
        hora_fim_prevista: hora(15),
        status_id: statusFinalizada.id,
        data_hora_inicio_real: new Date(),
        data_hora_fim_real: new Date(),
        odometro_inicial: veiculo.odometro_atual - 300,
        odometro_final: veiculo.odometro_atual,
        distancia_percorrida: 300,
      },
    });
    console.log('Veículo 1: 3 viagens criadas (CRIADA, EM_ANDAMENTO, FINALIZADA).');
  } else {
    console.log(`Veículo 1 já tem ${temV1} viagem(ns) — pulado.`);
  }

  const temV2 = await prisma.viagens.count({
    where: { motorista_id: motorista.id, veiculo_id: veiculo2.id, data_hora_exclusao: null },
  });
  if (temV2 === 0) {
    await prisma.viagens.create({
      data: {
        ...base,
        veiculo_id: veiculo2.id,
        destino: 'TERMINAL RODOVIÁRIO — APARECIDA DE GOIÂNIA, GO',
        data_viagem: dataDia(1),
        hora_inicio_prevista: hora(7),
        hora_fim_prevista: hora(11),
        status_id: statusCriada.id,
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
