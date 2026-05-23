import { Test, TestingModule } from '@nestjs/testing';
import { AlertasService } from './alertas.service';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Fixar o relógio em uma data conhecida torna os deltas (dias até vencer,
 * minutos de atraso) determinísticos. Todas as datas mockadas neste arquivo
 * usam "hoje = 2026-05-20" como referência.
 */
const HOJE_FIXO = new Date('2026-05-20T10:00:00');

describe('AlertasService', () => {
  let service: AlertasService;
  let prisma: {
    usuario: { findMany: jest.Mock };
    viagem: { findMany: jest.Mock };
    despesaVeiculo: { findMany: jest.Mock; findFirst: jest.Mock };
    veiculo: { findMany: jest.Mock };
  };

  beforeAll(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    jest.setSystemTime(HOJE_FIXO);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    prisma = {
      usuario: { findMany: jest.fn().mockResolvedValue([]) },
      viagem: { findMany: jest.fn().mockResolvedValue([]) },
      despesaVeiculo: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      veiculo: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [AlertasService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = modulo.get<AlertasService>(AlertasService);
  });

  describe('CNH', () => {
    it('deve gerar alerta cnh_vencida com severidade alto quando validade passou', async () => {
      prisma.usuario.findMany.mockResolvedValue([
        {
          id: 'm1',
          nome: 'JOAO',
          matricula: '0000001234',
          cnh: '12345',
          cnhValidade: new Date(2026, 4, 15),
        },
      ]);
      const r = await service.listar();
      expect(r).toHaveLength(1);
      expect(r[0]).toMatchObject({ tipo: 'cnh_vencida', severidade: 'alto', alvoTipo: 'motorista' });
      expect(r[0]?.titulo).toMatch(/vencida há 5 dias/);
    });

    it('deve gerar cnh_vencendo com severidade media quando faltam <=7 dias', async () => {
      prisma.usuario.findMany.mockResolvedValue([
        {
          id: 'm1',
          nome: 'JOAO',
          matricula: '0000001234',
          cnh: '12345',
          cnhValidade: new Date(2026, 4, 25),
        },
      ]);
      const r = await service.listar();
      expect(r[0]).toMatchObject({ tipo: 'cnh_vencendo', severidade: 'medio' });
      expect(r[0]?.titulo).toMatch(/vence em 5 dias/);
    });

    it('deve gerar cnh_vencendo com severidade baixa quando faltam >7 dias', async () => {
      prisma.usuario.findMany.mockResolvedValue([
        {
          id: 'm1',
          nome: 'JOAO',
          matricula: '0000001234',
          cnh: '12345',
          cnhValidade: new Date(2026, 5, 10),
        },
      ]);
      const r = await service.listar();
      expect(r[0]).toMatchObject({ tipo: 'cnh_vencendo', severidade: 'baixo' });
    });
  });

  describe('viagens', () => {
    it('deve ignorar viagem EM_ANDAMENTO ainda dentro do horario', async () => {
      // Fim previsto às 23:00 Brasília do mesmo dia (hoje 10:00 — ainda não atrasou)
      const hora23 = new Date(0);
      hora23.setUTCHours(23, 0, 0, 0);
      prisma.viagem.findMany.mockImplementation(({ where }) => {
        if (where.status === 'EM_ANDAMENTO') {
          return Promise.resolve([
            {
              id: 'v1',
              dataViagem: new Date(2026, 4, 20),
              horaFimPrevista: hora23,
              destino: 'DESTINO',
              motorista: { nome: 'JOAO' },
              veiculo: { placa: 'ABC1D23' },
            },
          ]);
        }
        return Promise.resolve([]);
      });
      const r = await service.listar();
      expect(r.filter((a) => a.tipo === 'viagem_atrasada')).toHaveLength(0);
    });

    it('deve gerar viagem_sem_inicio para CRIADA com dataViagem no passado', async () => {
      prisma.viagem.findMany.mockImplementation(({ where }) => {
        if (where.status === 'CRIADA') {
          return Promise.resolve([
            {
              id: 'v2',
              dataViagem: new Date(2026, 4, 17),
              destino: 'DESTINO',
              motorista: { nome: 'JOAO' },
              veiculo: { placa: 'ABC1D23' },
            },
          ]);
        }
        return Promise.resolve([]);
      });
      const r = await service.listar();
      const a = r.find((x) => x.tipo === 'viagem_sem_inicio');
      expect(a).toBeDefined();
      expect(a?.severidade).toBe('alto'); // 3 dias > 2
      expect(a?.titulo).toMatch(/há 3 dias/);
    });
  });

  describe('multas', () => {
    it('deve gerar multa_vencida e multa_vencendo com severidades certas', async () => {
      prisma.despesaVeiculo.findMany.mockImplementation(({ where }) => {
        if (where.tipo === 'multa') {
          return Promise.resolve([
            {
              id: 'd1',
              tipo: 'multa',
              valor: 195.23,
              descricao: 'EXCESSO DE VELOCIDADE',
              numeroAuto: 'AB-1',
              dataVencimento: new Date(2026, 4, 15),
              veiculoId: 'v1',
              veiculo: { placa: 'ABC1D23', marca: 'Toyota', modelo: 'Corolla' },
            },
            {
              id: 'd2',
              tipo: 'multa',
              valor: 100,
              descricao: 'OUTRA',
              numeroAuto: null,
              dataVencimento: new Date(2026, 4, 21),
              veiculoId: 'v1',
              veiculo: { placa: 'ABC1D23', marca: 'Toyota', modelo: 'Corolla' },
            },
          ]);
        }
        return Promise.resolve([]);
      });
      const r = await service.listar();
      const vencida = r.find((a) => a.id === 'multa:d1');
      const vencendo = r.find((a) => a.id === 'multa:d2');
      expect(vencida).toMatchObject({ tipo: 'multa_vencida', severidade: 'alto' });
      expect(vencendo).toMatchObject({ tipo: 'multa_vencendo', severidade: 'medio' });
    });
  });

  describe('seguros', () => {
    it('deve manter apenas o seguro mais recente por veiculo', async () => {
      prisma.despesaVeiculo.findMany.mockImplementation(({ where }) => {
        if (where.tipo === 'seguro') {
          return Promise.resolve([
            {
              id: 's1',
              veiculoId: 'v1',
              valor: 3000,
              descricao: 'SEGURO ANTIGO',
              seguradora: 'PORTO',
              numeroApolice: '123',
              vigenciaFim: new Date(2026, 4, 25),
              veiculo: { placa: 'ABC1D23', marca: 'Toyota', modelo: 'Corolla' },
            },
            {
              id: 's2',
              veiculoId: 'v1',
              valor: 3500,
              descricao: 'SEGURO NOVO',
              seguradora: 'PORTO',
              numeroApolice: '456',
              vigenciaFim: new Date(2026, 5, 10),
              veiculo: { placa: 'ABC1D23', marca: 'Toyota', modelo: 'Corolla' },
            },
          ]);
        }
        return Promise.resolve([]);
      });
      const r = await service.listar();
      const seguros = r.filter((a) => a.tipo === 'seguro_vencendo' || a.tipo === 'seguro_vencido');
      expect(seguros).toHaveLength(1);
      expect(seguros[0]?.id).toBe('seguro:s2');
    });
  });

  describe('manutencao preventiva', () => {
    it('deve gerar manutencao_devida (severidade alto) quando excedente > 5000 km', async () => {
      // odometroAtual 31k - ultima 10k = 21k -> excedente 21k-10k=11k > 5000 -> alto
      prisma.veiculo.findMany.mockResolvedValue([
        { id: 'v1', placa: 'ABC1D23', marca: 'Toyota', modelo: 'Corolla', odometroAtual: 31_000 },
      ]);
      prisma.despesaVeiculo.findMany.mockImplementation(({ where }) => {
        if (where.tipo === 'manutencao') {
          return Promise.resolve([{ veiculoId: 'v1', odometro: 10_000, data: new Date(2026, 0, 1) }]);
        }
        return Promise.resolve([]);
      });
      const r = await service.listar();
      const a = r.find((x) => x.tipo === 'manutencao_devida');
      expect(a).toBeDefined();
      expect(a?.severidade).toBe('alto');
    });

    it('nao deve gerar manutencao_devida sem historico de preventiva', async () => {
      prisma.veiculo.findMany.mockResolvedValue([
        { id: 'v1', placa: 'ABC1D23', marca: 'Toyota', modelo: 'Corolla', odometroAtual: 50_000 },
      ]);
      // findMany de manutencao retorna lista vazia (default)
      const r = await service.listar();
      expect(r.find((x) => x.tipo === 'manutencao_devida')).toBeUndefined();
    });

    it('nao deve gerar quando km desde a ultima < 10000', async () => {
      prisma.veiculo.findMany.mockResolvedValue([
        { id: 'v1', placa: 'ABC1D23', marca: 'Toyota', modelo: 'Corolla', odometroAtual: 15_000 },
      ]);
      prisma.despesaVeiculo.findMany.mockImplementation(({ where }) => {
        if (where.tipo === 'manutencao') {
          return Promise.resolve([{ veiculoId: 'v1', odometro: 10_000, data: new Date(2026, 0, 1) }]);
        }
        return Promise.resolve([]);
      });
      const r = await service.listar();
      expect(r.find((x) => x.tipo === 'manutencao_devida')).toBeUndefined();
    });
  });

  describe('ordenacao', () => {
    it('deve ordenar do alto para o baixo', async () => {
      prisma.usuario.findMany.mockResolvedValue([
        // baixo: cnh vence em 15 dias
        {
          id: 'm1',
          nome: 'A',
          matricula: '0000000001',
          cnh: '1',
          cnhValidade: new Date(2026, 5, 4),
        },
        // alto: cnh vencida ontem
        {
          id: 'm2',
          nome: 'B',
          matricula: '0000000002',
          cnh: '2',
          cnhValidade: new Date(2026, 4, 19),
        },
      ]);
      const r = await service.listar();
      expect(r[0]?.severidade).toBe('alto');
      expect(r[1]?.severidade).toBe('baixo');
    });
  });
});
