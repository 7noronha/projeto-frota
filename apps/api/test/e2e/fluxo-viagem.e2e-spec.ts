import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';

// Identificadores únicos para dados de teste — facilita limpeza
const MATRICULA_OPERADOR = '9900000001';
const MATRICULA_MOTORISTA = '9900000002';
const PLACA_TESTE = 'E2E0T01';
const SENHA_TESTE = 'SenhaTeste1!';
const DATA_VIAGEM = '2030-12-20';

async function limparDadosTeste(prisma: PrismaService): Promise<void> {
  const motoristaTeste = await prisma.usuario.findFirst({
    where: { matricula: MATRICULA_MOTORISTA },
  });

  if (motoristaTeste) {
    await prisma.viagem.deleteMany({ where: { motoristaId: motoristaTeste.id } });
  }

  await prisma.veiculo.deleteMany({ where: { placa: PLACA_TESTE } });
  await prisma.usuario.deleteMany({
    where: { matricula: { in: [MATRICULA_OPERADOR, MATRICULA_MOTORISTA] } },
  });
}

describe('Fluxo completo de viagem (E2E)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  let tokenOperador: string;
  let motoristaId: string;
  let veiculoId: string;
  let viagemId: string;

  beforeAll(async () => {
    const fixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = fixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = app.get(PrismaService);
    await limparDadosTeste(prisma);

    const senhaHash = await bcrypt.hash(SENHA_TESTE, 10);

    // Configuração da sede (upsert para não conflitar com seed)
    await prisma.configuracao.upsert({
      where: { chave: 'endereco_sede' },
      create: { chave: 'endereco_sede', valor: 'Rua de Teste, 1 — São Paulo, SP' },
      update: {},
    });

    // Operador de teste
    await prisma.usuario.create({
      data: {
        matricula: MATRICULA_OPERADOR,
        nome: 'Operador Teste E2E',
        senhaHash,
        perfil: 'operador',
        ativo: true,
      },
    });

    // Motorista de teste
    const motorista = await prisma.usuario.create({
      data: {
        matricula: MATRICULA_MOTORISTA,
        nome: 'Motorista Teste E2E',
        senhaHash,
        perfil: 'motorista',
        ativo: true,
        cnh: '99900000001',
        cnhValidade: new Date('2035-12-31'),
      },
    });
    motoristaId = motorista.id;

    // Veículo de teste
    const veiculo = await prisma.veiculo.create({
      data: {
        placa: PLACA_TESTE,
        marca: 'Fiat',
        modelo: 'Strada',
        anoFabricacao: 2024,
        anoModelo: 2025,
        cor: 'Branco',
        renavam: '99900000001',
        odometroAtual: 10000,
        dataAquisicao: new Date('2024-01-01'),
        situacao: 'ativo',
      },
    });
    veiculoId = veiculo.id;
  });

  afterAll(async () => {
    await limparDadosTeste(prisma);
    await app.close();
  });

  // ─── Auth ───────────────────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    it('deve autenticar o operador e retornar um JWT', async () => {
      const resposta = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { matricula: MATRICULA_OPERADOR, senha: SENHA_TESTE },
      });

      expect(resposta.statusCode).toBe(200);
      const corpo = resposta.json<{ token: string; usuario: { matricula: string } }>();
      expect(corpo.token).toBeDefined();
      expect(corpo.usuario.matricula).toBe(MATRICULA_OPERADOR);
      expect(corpo.usuario).not.toHaveProperty('senhaHash');

      tokenOperador = corpo.token;
    });

    it('deve retornar 401 com credenciais inválidas', async () => {
      const resposta = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { matricula: MATRICULA_OPERADOR, senha: 'senhaErrada' },
      });

      expect(resposta.statusCode).toBe(401);
    });
  });

  // ─── Criar viagem ───────────────────────────────────────────────────────────

  describe('POST /viagens', () => {
    it('deve criar uma viagem com status CRIADA', async () => {
      const resposta = await app.inject({
        method: 'POST',
        url: '/viagens',
        headers: { Authorization: `Bearer ${tokenOperador}` },
        payload: {
          destino: 'Av. Paulista, 1000 — São Paulo, SP',
          dataViagem: DATA_VIAGEM,
          horaInicioPrevista: '08:00',
          horaFimPrevista: '12:00',
          motoristaId,
          veiculoId,
          solicitadoPor: 'Gerente Teste',
          autorizadoPor: 'Diretor Teste',
        },
      });

      expect(resposta.statusCode).toBe(201);
      const corpo = resposta.json<{ id: string; status: string; origem: string }>();
      expect(corpo.status).toBe('CRIADA');
      expect(corpo.origem).toBe('Rua de Teste, 1 — São Paulo, SP');
      expect(corpo.id).toBeDefined();

      viagemId = corpo.id;
    });

    it('deve retornar 400 ao tentar criar segunda viagem para o mesmo motorista na mesma data', async () => {
      const resposta = await app.inject({
        method: 'POST',
        url: '/viagens',
        headers: { Authorization: `Bearer ${tokenOperador}` },
        payload: {
          destino: 'Rua das Flores, 50',
          dataViagem: DATA_VIAGEM,
          horaInicioPrevista: '14:00',
          horaFimPrevista: '16:00',
          motoristaId,
          veiculoId,
          solicitadoPor: 'Gerente Teste',
          autorizadoPor: 'Diretor Teste',
        },
      });

      expect(resposta.statusCode).toBe(400);
    });

    it('deve retornar 401 sem token', async () => {
      const resposta = await app.inject({
        method: 'POST',
        url: '/viagens',
        payload: { destino: 'Teste', dataViagem: DATA_VIAGEM },
      });

      expect(resposta.statusCode).toBe(401);
    });
  });

  // ─── Buscar viagem ──────────────────────────────────────────────────────────

  describe('GET /viagens/:id', () => {
    it('deve retornar a viagem criada com motorista e veículo aninhados', async () => {
      const resposta = await app.inject({
        method: 'GET',
        url: `/viagens/${viagemId}`,
        headers: { Authorization: `Bearer ${tokenOperador}` },
      });

      expect(resposta.statusCode).toBe(200);
      const corpo = resposta.json<{
        id: string;
        status: string;
        motorista: { matricula: string };
        veiculo: { placa: string };
      }>();
      expect(corpo.id).toBe(viagemId);
      expect(corpo.status).toBe('CRIADA');
      expect(corpo.motorista.matricula).toBe(MATRICULA_MOTORISTA);
      expect(corpo.veiculo.placa).toBe(PLACA_TESTE);
    });
  });

  // ─── Iniciar viagem ─────────────────────────────────────────────────────────

  describe('PATCH /viagens/:id/iniciar', () => {
    it('deve iniciar a viagem e mudar status para EM_ANDAMENTO', async () => {
      const resposta = await app.inject({
        method: 'PATCH',
        url: `/viagens/${viagemId}/iniciar`,
        headers: { Authorization: `Bearer ${tokenOperador}` },
        payload: { odometroInicial: 10100 },
      });

      expect(resposta.statusCode).toBe(200);
      const corpo = resposta.json<{ status: string; odometroInicial: number }>();
      expect(corpo.status).toBe('EM_ANDAMENTO');
      expect(corpo.odometroInicial).toBe(10100);
    });

    it('deve retornar 400 ao tentar iniciar uma viagem já em andamento', async () => {
      const resposta = await app.inject({
        method: 'PATCH',
        url: `/viagens/${viagemId}/iniciar`,
        headers: { Authorization: `Bearer ${tokenOperador}` },
        payload: { odometroInicial: 10200 },
      });

      expect(resposta.statusCode).toBe(400);
    });
  });

  // ─── Finalizar viagem ───────────────────────────────────────────────────────

  describe('PATCH /viagens/:id/finalizar', () => {
    it('deve finalizar a viagem, calcular distância e atualizar odômetro do veículo', async () => {
      const resposta = await app.inject({
        method: 'PATCH',
        url: `/viagens/${viagemId}/finalizar`,
        headers: { Authorization: `Bearer ${tokenOperador}` },
        payload: { odometroFinal: 10430 },
      });

      expect(resposta.statusCode).toBe(200);
      const corpo = resposta.json<{
        status: string;
        odometroFinal: number;
        distanciaPercorrida: number;
      }>();
      expect(corpo.status).toBe('FINALIZADA');
      expect(corpo.odometroFinal).toBe(10430);
      expect(corpo.distanciaPercorrida).toBe(330); // 10430 - 10100
    });

    it('deve ter atualizado o odômetro do veículo no banco', async () => {
      const veiculo = await prisma.veiculo.findFirst({ where: { placa: PLACA_TESTE } });
      expect(veiculo?.odometroAtual).toBe(10430);
    });

    it('deve retornar 400 ao tentar finalizar uma viagem já finalizada', async () => {
      const resposta = await app.inject({
        method: 'PATCH',
        url: `/viagens/${viagemId}/finalizar`,
        headers: { Authorization: `Bearer ${tokenOperador}` },
        payload: { odometroFinal: 11000 },
      });

      expect(resposta.statusCode).toBe(400);
    });
  });

  // ─── Listagem ───────────────────────────────────────────────────────────────

  describe('GET /viagens', () => {
    it('deve retornar a viagem finalizada na listagem', async () => {
      const resposta = await app.inject({
        method: 'GET',
        url: `/viagens?status=FINALIZADA`,
        headers: { Authorization: `Bearer ${tokenOperador}` },
      });

      expect(resposta.statusCode).toBe(200);
      const corpo = resposta.json<{ dados: { id: string }[]; total: number }>();
      expect(corpo.total).toBeGreaterThanOrEqual(1);
      const ids = corpo.dados.map((v) => v.id);
      expect(ids).toContain(viagemId);
    });
  });
});
