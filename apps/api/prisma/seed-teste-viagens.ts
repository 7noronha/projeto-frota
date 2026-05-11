/**
 * Seed de TESTE — popula 10 viagens (variadas) + alguns veículos adicionais
 * para tornar o dashboard visualmente útil.
 *
 * Uso: bun run prisma:seed:teste
 *
 * Idempotente em parte: só cria viagens novas se existirem menos de 10 no banco.
 * Veículos novos são criados via upsert pela placa.
 */
import { PrismaClient } from '@prisma/client';
import { agoraBrasilia } from '@fleetops/utils/datetime';

const prisma = new PrismaClient();

interface VeiculoSeed {
  placa: string;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  anoModelo: number;
  cor: string;
  renavam: string;
  odometroAtual: number;
}

const VEICULOS_NOVOS: VeiculoSeed[] = [
  {
    placa: 'BRA2E19',
    marca: 'FIAT',
    modelo: 'STRADA',
    anoFabricacao: 2024,
    anoModelo: 2025,
    cor: 'PRATA',
    renavam: '01234567890',
    odometroAtual: 8500,
  },
  {
    placa: 'BRA3F20',
    marca: 'VOLKSWAGEN',
    modelo: 'SAVEIRO',
    anoFabricacao: 2023,
    anoModelo: 2024,
    cor: 'BRANCO',
    renavam: '02345678901',
    odometroAtual: 22300,
  },
  {
    placa: 'BRA4G21',
    marca: 'TOYOTA',
    modelo: 'HILUX',
    anoFabricacao: 2022,
    anoModelo: 2023,
    cor: 'PRETO',
    renavam: '03456789012',
    odometroAtual: 47800,
  },
  {
    placa: 'BRA5H22',
    marca: 'FORD',
    modelo: 'RANGER',
    anoFabricacao: 2024,
    anoModelo: 2024,
    cor: 'AZUL',
    renavam: '04567890123',
    odometroAtual: 12100,
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
  return arr[indice % arr.length];
}

async function main(): Promise<void> {
  console.log('Seed de TESTE — viagens variadas\n');

  // 1. Operador criador (qualquer admin/operador serve)
  const operador = await prisma.usuario.findFirst({
    where: { perfil: { in: ['admin', 'operador'] }, ativo: true, dataExclusao: null },
  });
  if (!operador) {
    throw new Error('Nenhum operador/admin ativo encontrado. Rode prisma:seed primeiro.');
  }

  // 2. Garante 4 veículos adicionais (chega a ~6 total)
  console.log('Criando veículos...');
  for (const v of VEICULOS_NOVOS) {
    await prisma.veiculo.upsert({
      where: { placa: v.placa },
      update: {},
      create: {
        ...v,
        dataAquisicao: new Date('2023-01-15'),
        situacao: 'ativo',
        observacoes: 'VEÍCULO DE TESTE — SEED',
      },
    });
  }

  // 3. Coleta motoristas e veículos ativos
  const motoristas = await prisma.usuario.findMany({
    where: { perfil: 'motorista', ativo: true, dataExclusao: null, cnh: { not: null } },
  });
  const veiculos = await prisma.veiculo.findMany({
    where: { situacao: 'ativo', dataExclusao: null },
  });

  if (motoristas.length < 3 || veiculos.length < 3) {
    throw new Error(
      `Recursos insuficientes (motoristas=${motoristas.length}, veiculos=${veiculos.length}). ` +
        'Crie pelo menos 3 motoristas e 3 veículos antes.',
    );
  }
  console.log(
    `Disponível: ${motoristas.length} motoristas + ${veiculos.length} veículos. Criando viagens...\n`,
  );

  // 4. 10 viagens variadas
  // Estratégia: cada viagem usa motorista[i % N] e veiculo[i % M] em horário/dia diferente
  // pra evitar conflitos de overlap. Status: 3 EM_ANDAMENTO + 5 CRIADA + 2 FINALIZADA.
  const viagensExistentes = await prisma.viagem.count({ where: { dataExclusao: null } });
  if (viagensExistentes >= 10) {
    console.log(`Já existem ${viagensExistentes} viagens — pulando criação.`);
    return;
  }

  const definicoes: Array<{
    statusFinal: 'CRIADA' | 'EM_ANDAMENTO' | 'FINALIZADA';
    diaDelta: number; // 0 = hoje, +1 = amanha, -1 = ontem
    horaInicio: number;
    horaFim: number;
  }> = [
    // 3 em andamento (hoje, manhã/tarde)
    { statusFinal: 'EM_ANDAMENTO', diaDelta: 0, horaInicio: 8, horaFim: 12 },
    { statusFinal: 'EM_ANDAMENTO', diaDelta: 0, horaInicio: 9, horaFim: 13 },
    { statusFinal: 'EM_ANDAMENTO', diaDelta: 0, horaInicio: 10, horaFim: 16 },
    // 5 criadas (hoje futuro + amanhã)
    { statusFinal: 'CRIADA', diaDelta: 0, horaInicio: 14, horaFim: 18 },
    { statusFinal: 'CRIADA', diaDelta: 1, horaInicio: 7, horaFim: 11 },
    { statusFinal: 'CRIADA', diaDelta: 1, horaInicio: 8, horaFim: 14 },
    { statusFinal: 'CRIADA', diaDelta: 1, horaInicio: 13, horaFim: 17 },
    { statusFinal: 'CRIADA', diaDelta: 2, horaInicio: 9, horaFim: 15 },
    // 2 finalizadas (ontem)
    { statusFinal: 'FINALIZADA', diaDelta: -1, horaInicio: 8, horaFim: 14 },
    { statusFinal: 'FINALIZADA', diaDelta: -1, horaInicio: 15, horaFim: 18 },
  ];

  const sede =
    (await prisma.configuracao.findFirst({ where: { chave: 'endereco_sede' } }))?.valor ??
    'SEDE NÃO CONFIGURADA';

  for (let i = 0; i < definicoes.length; i++) {
    const def = definicoes[i];
    const motorista = motoristas[i % motoristas.length];
    const veiculo = veiculos[i % veiculos.length];
    const dataViagem = diaUtc(def.diaDelta);
    const horaInicioPrevista = horaUtc(def.horaInicio);
    const horaFimPrevista = horaUtc(def.horaFim);

    // Estado base CRIADA
    const dadosBase = {
      origem: sede,
      destino: escolher(DESTINOS, i),
      dataViagem,
      horaInicioPrevista,
      horaFimPrevista,
      motoristaId: motorista.id,
      veiculoId: veiculo.id,
      operadorCriadorId: operador.id,
      solicitadoPor: escolher(SOLICITANTES, i),
      autorizadoPor: escolher(AUTORIZADORES, i),
      observacoes: null,
      status: def.statusFinal,
    };

    // Campos específicos por status final
    const odoIni = veiculo.odometroAtual + i * 50;
    const dadosFinais =
      def.statusFinal === 'EM_ANDAMENTO'
        ? {
            ...dadosBase,
            dataHoraInicioReal: agoraBrasilia(),
            odometroInicial: odoIni,
          }
        : def.statusFinal === 'FINALIZADA'
          ? {
              ...dadosBase,
              dataHoraInicioReal: agoraBrasilia(),
              dataHoraFimReal: agoraBrasilia(),
              odometroInicial: odoIni,
              odometroFinal: odoIni + 250,
              distanciaPercorrida: 250,
            }
          : dadosBase;

    await prisma.viagem.create({ data: dadosFinais });
    console.log(
      `  [${i + 1}/10] ${def.statusFinal.padEnd(13)} → ${motorista.nome.slice(0, 20).padEnd(20)} | ${veiculo.placa} | ${escolher(DESTINOS, i).slice(0, 40)}`,
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
