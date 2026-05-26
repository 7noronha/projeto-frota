import { Test, TestingModule } from '@nestjs/testing';
import { AlertasService } from './alertas.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('AlertasService', () => {
  let service: AlertasService;
  let prisma: {
    perfis_usuario: { findUnique: jest.Mock };
    situacoes_veiculo: { findUnique: jest.Mock };
    status_viagem: { findUnique: jest.Mock };
    tipos_manutencao: { findUnique: jest.Mock };
    usuarios: { findMany: jest.Mock };
    viagens: { findMany: jest.Mock };
    multas: { findMany: jest.Mock };
    seguros: { findMany: jest.Mock };
    veiculos: { findMany: jest.Mock };
    manutencoes: { findMany: jest.Mock };
  };

  const hoje = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  function diasNoFuturo(n: number): Date {
    const d = new Date(hoje);
    d.setDate(d.getDate() + n);
    return d;
  }

  beforeEach(async () => {
    prisma = {
      perfis_usuario: { findUnique: jest.fn().mockResolvedValue({ id: 5, nome: 'motorista' }) },
      situacoes_veiculo: { findUnique: jest.fn().mockResolvedValue({ id: 1, nome: 'ativo' }) },
      status_viagem: {
        findUnique: jest.fn().mockImplementation(({ where: { nome } }: { where: { nome: string } }) =>
          Promise.resolve({ id: nome === 'EM_ANDAMENTO' ? 2 : 1, nome }),
        ),
      },
      tipos_manutencao: { findUnique: jest.fn().mockResolvedValue({ id: 1, nome: 'preventiva' }) },
      usuarios: { findMany: jest.fn().mockResolvedValue([]) },
      viagens: { findMany: jest.fn().mockResolvedValue([]) },
      multas: { findMany: jest.fn().mockResolvedValue([]) },
      seguros: { findMany: jest.fn().mockResolvedValue([]) },
      veiculos: { findMany: jest.fn().mockResolvedValue([]) },
      manutencoes: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [AlertasService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = modulo.get(AlertasService);
  });

  describe('listar() — sem dados', () => {
    it('deve retornar array vazio quando não há nada que gere alerta', async () => {
      const r = await service.listar();
      expect(r).toEqual([]);
    });
  });

  describe('CNH', () => {
    it('deve gerar alerta cnh_vencida quando CNH expirou', async () => {
      prisma.usuarios.findMany.mockResolvedValue([
        { id: 10, nome: 'João', matricula: '0000000010', cnh: '12345', cnh_validade: diasNoFuturo(-5) },
      ]);
      const r = await service.listar();
      expect(r).toHaveLength(1);
      expect(r[0].tipo).toBe('cnh_vencida');
      expect(r[0].severidade).toBe('alto');
      expect(r[0].alvoTipo).toBe('motorista');
    });

    it('deve gerar alerta cnh_vencendo com severidade media quando faltam <=7 dias', async () => {
      prisma.usuarios.findMany.mockResolvedValue([
        { id: 10, nome: 'Maria', matricula: '0000000010', cnh: '12345', cnh_validade: diasNoFuturo(5) },
      ]);
      const r = await service.listar();
      expect(r[0].tipo).toBe('cnh_vencendo');
      expect(r[0].severidade).toBe('medio');
    });

    it('deve gerar alerta cnh_vencendo com severidade baixa quando faltam >7 dias', async () => {
      prisma.usuarios.findMany.mockResolvedValue([
        { id: 10, nome: 'Carlos', matricula: '0000000010', cnh: '99999', cnh_validade: diasNoFuturo(20) },
      ]);
      const r = await service.listar();
      expect(r[0].tipo).toBe('cnh_vencendo');
      expect(r[0].severidade).toBe('baixo');
    });
  });

  describe('Multas', () => {
    it('deve gerar multa_vencida quando data_vencimento < hoje', async () => {
      prisma.multas.findMany.mockResolvedValue([
        {
          id: 1,
          veiculo_id: 1,
          valor: 293.47,
          descricao: 'Excesso de velocidade',
          numero_auto: 'AB123',
          data_vencimento: diasNoFuturo(-2),
          veiculo: { placa: 'ABC1D23', marca: 'Fiat', modelo: 'Strada' },
        },
      ]);
      const r = await service.listar();
      expect(r[0].tipo).toBe('multa_vencida');
      expect(r[0].severidade).toBe('alto');
    });

    it('deve gerar multa_vencendo quando data_vencimento <= hoje + 7', async () => {
      prisma.multas.findMany.mockResolvedValue([
        {
          id: 1,
          veiculo_id: 1,
          valor: 100,
          descricao: 'Multa leve',
          numero_auto: null,
          data_vencimento: diasNoFuturo(5),
          veiculo: { placa: 'XYZ', marca: 'VW', modelo: 'Saveiro' },
        },
      ]);
      const r = await service.listar();
      expect(r[0].tipo).toBe('multa_vencendo');
    });
  });

  describe('Seguros', () => {
    it('deve gerar seguro_vencido quando vigencia_fim < hoje', async () => {
      prisma.seguros.findMany.mockResolvedValue([
        {
          id: 1,
          veiculo_id: 1,
          seguradora: 'Porto Seguro',
          numero_apolice: '12345',
          vigencia_fim: diasNoFuturo(-10),
          veiculo: { placa: 'ABC', marca: 'Fiat', modelo: 'Strada' },
        },
      ]);
      const r = await service.listar();
      expect(r[0].tipo).toBe('seguro_vencido');
      expect(r[0].severidade).toBe('alto');
    });

    it('deve manter apenas o seguro mais recente por veículo (mais antigo é ignorado)', async () => {
      prisma.seguros.findMany.mockResolvedValue([
        {
          id: 1,
          veiculo_id: 1,
          seguradora: 'Antiga',
          numero_apolice: '111',
          vigencia_fim: diasNoFuturo(-100),
          veiculo: { placa: 'ABC', marca: 'X', modelo: 'Y' },
        },
        {
          id: 2,
          veiculo_id: 1,
          seguradora: 'Atual',
          numero_apolice: '222',
          vigencia_fim: diasNoFuturo(-2),
          veiculo: { placa: 'ABC', marca: 'X', modelo: 'Y' },
        },
      ]);
      const r = await service.listar();
      // Só 1 alerta — o mais recente (id 2)
      expect(r).toHaveLength(1);
      expect(r[0].alvoId).toBe(2);
    });
  });

  describe('Manutenção preventiva', () => {
    it('deve gerar manutencao_devida quando km desde a última > 10.000', async () => {
      prisma.veiculos.findMany.mockResolvedValue([
        { id: 1, placa: 'ABC', marca: 'Fiat', modelo: 'Strada', odometro_atual: 25000 },
      ]);
      prisma.manutencoes.findMany.mockResolvedValue([
        { veiculo_id: 1, odometro: 10000, data: diasNoFuturo(-200) },
      ]);
      const r = await service.listar();
      expect(r[0].tipo).toBe('manutencao_devida');
      // 15.000 km desde a última (intervalo padrão é 10.000)
      expect(r[0].titulo).toContain('15');
    });

    it('NÃO deve gerar alerta quando km desde a última < 10.000', async () => {
      prisma.veiculos.findMany.mockResolvedValue([
        { id: 1, placa: 'ABC', marca: 'F', modelo: 'S', odometro_atual: 15000 },
      ]);
      prisma.manutencoes.findMany.mockResolvedValue([
        { veiculo_id: 1, odometro: 10000, data: diasNoFuturo(-50) },
      ]);
      const r = await service.listar();
      expect(r).toEqual([]);
    });

    it('NÃO deve gerar alerta quando veículo nunca teve preventiva', async () => {
      prisma.veiculos.findMany.mockResolvedValue([
        { id: 1, placa: 'ABC', marca: 'F', modelo: 'S', odometro_atual: 100000 },
      ]);
      prisma.manutencoes.findMany.mockResolvedValue([]); // sem histórico
      const r = await service.listar();
      expect(r).toEqual([]);
    });
  });

  describe('Ordenação', () => {
    it('deve ordenar alertas por severidade (alto → medio → baixo)', async () => {
      prisma.usuarios.findMany.mockResolvedValue([
        { id: 1, nome: 'Baixa', matricula: '01', cnh: '1', cnh_validade: diasNoFuturo(20) },
        { id: 2, nome: 'Alta', matricula: '02', cnh: '2', cnh_validade: diasNoFuturo(-5) },
        { id: 3, nome: 'Media', matricula: '03', cnh: '3', cnh_validade: diasNoFuturo(5) },
      ]);
      const r = await service.listar();
      expect(r[0].severidade).toBe('alto');
      expect(r[1].severidade).toBe('medio');
      expect(r[2].severidade).toBe('baixo');
    });
  });
});
