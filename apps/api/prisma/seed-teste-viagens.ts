/**
 * Seed de TESTE — popula 10 viagens (variadas) + alguns veículos adicionais
 * para tornar o dashboard visualmente útil.
 *
 * Uso: bun run prisma:seed:teste
 */
import { PrismaClient } from '@prisma/client';
import { agoraBrasilia } from '@fleetops/utils/datetime';

const prisma = new PrismaClient();

interface VeiculoSeed {
  placa: string;
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  ano_modelo: number;
  cor: string;
  renavam: string;
  odometro_atual: number;
}

const VEICULOS_NOVOS: VeiculoSeed[] = [
  {
    placa: 'BRA2E19',
    marca: 'FIAT',
    modelo: 'STRADA',
    ano_fabricacao: 2024,
    ano_modelo: 2025,
    cor: 'PRATA',
    renavam: '01234567890',
    odometro_atual: 8500,
  },
  {
    placa: 'BRA3F20',
    marca: 'VOLKSWAGEN',
    modelo: 'SAVEIRO',
    ano_fabricacao: 2023,
    ano_modelo: 2024,
    cor: 'BRANCO',
    renavam: '02345678901',
    odometro_atual: 22300,
  },
  {
    placa: 'BRA4G21',
    marca: 'TOYOTA',
    modelo: 'HILUX',
    ano_fabricacao: 2022,
    ano_modelo: 2023,
    cor: 'PRETO',
    renavam: '03456789012',
    odometro_atual: 47800,
  },
  {
    placa: 'BRA5H22',
    marca: 'FORD',
    modelo: 'RANGER',
    ano_fabricacao: 2024,
    ano_modelo: 2024,
    cor: 'AZUL',
    renavam: '04567890123',
    odometro_atual: 12100,
  },
];

const DESTINOS = [
  'AV. PAULISTA, 1578 — SÃO PAULO, SP',
  'CENTRO ADMINISTRATIVO — GOIÂNIA, GO',
  'AEROPORTO DE CONFINS — BELO HORIZONTE, MG',
  'PORTO DE SANTOS — SANTOS, SP',
  'ASA SUL QUADRA 209 — BRASÍLIA, DF',
  'RODOVIA DOS BANDEIRANTES KM 88 — CAMPINAS, SP',
  'PARQUE INDUSTRIAL — ANÁPOLIS, GO',
  'CENTRO DE DISTRIBUIÇÃO LESTE — GUARULHOS, SP',
  'AV. BRASIL, 5000 — RIO DE JANEIRO, RJ',
  'TERMINAL RODOVIÁRIO — UBERLÂNDIA, MG',
];

const SOLICITANTES = ['JOÃO SILVA', 'MARIA OLIVEIRA', 'CARLOS SOUZA', 'ANA LIMA', 'PEDRO ROCHA'];
const AUTORIZADORES = ['DIRETORIA OPERACIONAL', 'GERÊNCIA DE FROTAS', 'COORD. LOGÍSTICA'];

function horaUtc(horas: number, minutos = 0): Date {
  const d = new Date(0);
  d.setUTCHours(horas, minutos, 0, 0);
  return d;
}

function diaUtc(deltaDias: number): Date {
  const hoje = agoraBrasilia();
  const d = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
  d.setUTCDate(d.getUTCDate() + deltaDias);
  return d;
}

function escolher<T>(arr: T[], indice: number): T {
  return arr[indice % arr.length]!;
}

async function main(): Promise<void> {
  console.log('Seed de TESTE — viagens variadas\n');

  const [perfilAdmin, perfilOperador, perfilMotorista, situacaoAtivo, statusCriada, statusEmAndamento, statusFinalizada] =
    await Promise.all([
      prisma.perfis_usuario.findUnique({ where: { nome: 'admin' } }),
      prisma.perfis_usuario.findUnique({ where: { nome: 'operador' } }),
      prisma.perfis_usuario.findUnique({ where: { nome: 'motorista' } }),
      prisma.situacoes_veiculo.findUnique({ where: { nome: 'ativo' } }),
      prisma.status_viagem.findUnique({ where: { nome: 'CRIADA' } }),
      prisma.status_viagem.findUnique({ where: { nome: 'EM_ANDAMENTO' } }),
      prisma.status_viagem.findUnique({ where: { nome: 'FINALIZADA' } }),
    ]);

  if (!perfilAdmin || !perfilOperador || !perfilMotorista || !situacaoAtivo || !statusCriada || !statusEmAndamento || !statusFinalizada) {
    throw new Error('Lookups base ausentes — rode o seed principal antes.');
  }

  const operador = await prisma.usuarios.findFirst({
    where: {
      perfil_id: { in: [perfilAdmin.id, perfilOperador.id] },
      ativo: true,
      data_hora_exclusao: null,
    },
  });
  if (!operador) {
    throw new Error('Nenhum operador/admin ativo encontrado. Rode prisma:seed primeiro.');
  }

  console.log('Criando veículos...');
  for (const v of VEICULOS_NOVOS) {
    await prisma.veiculos.upsert({
      where: { placa: v.placa },
      update: {},
      create: {
        ...v,
        data_aquisicao: new Date('2023-01-15'),
        situacao_id: situacaoAtivo.id,
        observacoes: 'VEÍCULO DE TESTE — SEED',
      },
    });
  }

  const motoristas = await prisma.usuarios.findMany({
    where: {
      perfil_id: perfilMotorista.id,
      ativo: true,
      data_hora_exclusao: null,
      cnh: { not: null },
    },
  });
  const veiculos = await prisma.veiculos.findMany({
    where: { situacao_id: situacaoAtivo.id, data_hora_exclusao: null },
  });

  if (motoristas.length < 3 || veiculos.length < 3) {
    throw new Error(
      `Recursos insuficientes (motoristas=${motoristas.length}, veiculos=${veiculos.length}).`,
    );
  }
  console.log(
    `Disponível: ${motoristas.length} motoristas + ${veiculos.length} veículos. Criando viagens...\n`,
  );

  const viagensExistentes = await prisma.viagens.count({ where: { data_hora_exclusao: null } });
  if (viagensExistentes >= 10) {
    console.log(`Já existem ${viagensExistentes} viagens — pulando criação.`);
    return;
  }

  const definicoes: Array<{
    statusId: number;
    statusNome: string;
    diaDelta: number;
    horaInicio: number;
    horaFim: number;
  }> = [
    { statusId: statusEmAndamento.id, statusNome: 'EM_ANDAMENTO', diaDelta: 0, horaInicio: 8, horaFim: 12 },
    { statusId: statusEmAndamento.id, statusNome: 'EM_ANDAMENTO', diaDelta: 0, horaInicio: 9, horaFim: 13 },
    { statusId: statusEmAndamento.id, statusNome: 'EM_ANDAMENTO', diaDelta: 0, horaInicio: 10, horaFim: 16 },
    { statusId: statusCriada.id, statusNome: 'CRIADA', diaDelta: 0, horaInicio: 14, horaFim: 18 },
    { statusId: statusCriada.id, statusNome: 'CRIADA', diaDelta: 1, horaInicio: 7, horaFim: 11 },
    { statusId: statusCriada.id, statusNome: 'CRIADA', diaDelta: 1, horaInicio: 8, horaFim: 14 },
    { statusId: statusCriada.id, statusNome: 'CRIADA', diaDelta: 1, horaInicio: 13, horaFim: 17 },
    { statusId: statusCriada.id, statusNome: 'CRIADA', diaDelta: 2, horaInicio: 9, horaFim: 15 },
    { statusId: statusFinalizada.id, statusNome: 'FINALIZADA', diaDelta: -1, horaInicio: 8, horaFim: 14 },
    { statusId: statusFinalizada.id, statusNome: 'FINALIZADA', diaDelta: -1, horaInicio: 15, horaFim: 18 },
  ];

  const sede =
    (await prisma.configuracoes.findFirst({ where: { chave: 'endereco_sede' } }))?.valor ??
    'SEDE NÃO CONFIGURADA';

  for (let i = 0; i < definicoes.length; i++) {
    const def = definicoes[i]!;
    const motorista = motoristas[i % motoristas.length]!;
    const veiculo = veiculos[i % veiculos.length]!;
    const dataViagem = diaUtc(def.diaDelta);
    const horaInicioPrevista = horaUtc(def.horaInicio);
    const horaFimPrevista = horaUtc(def.horaFim);

    const dadosBase = {
      origem: sede,
      destino: escolher(DESTINOS, i),
      data_viagem: dataViagem,
      hora_inicio_prevista: horaInicioPrevista,
      hora_fim_prevista: horaFimPrevista,
      motorista_id: motorista.id,
      veiculo_id: veiculo.id,
      operador_criador_id: operador.id,
      solicitado_por: escolher(SOLICITANTES, i),
      autorizado_por: escolher(AUTORIZADORES, i),
      observacoes: null,
      status_id: def.statusId,
    };

    const odoIni = veiculo.odometro_atual + i * 50;
    const dadosFinais =
      def.statusNome === 'EM_ANDAMENTO'
        ? {
            ...dadosBase,
            data_hora_inicio_real: agoraBrasilia(),
            odometro_inicial: odoIni,
          }
        : def.statusNome === 'FINALIZADA'
          ? {
              ...dadosBase,
              data_hora_inicio_real: agoraBrasilia(),
              data_hora_fim_real: agoraBrasilia(),
              odometro_inicial: odoIni,
              odometro_final: odoIni + 250,
              distancia_percorrida: 250,
            }
          : dadosBase;

    await prisma.viagens.create({ data: dadosFinais });
    console.log(
      `  [${i + 1}/10] ${def.statusNome.padEnd(13)} → ${motorista.nome.slice(0, 20).padEnd(20)} | ${veiculo.placa} | ${escolher(DESTINOS, i).slice(0, 40)}`,
    );
  }

  console.log('\nSeed de teste concluído.');
}

main()
  .catch((erro) => {
    console.error('Erro ao executar seed de teste:', erro);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
