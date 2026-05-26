import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { VeiculosService } from './veiculos.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('VeiculosService', () => {
  let service: VeiculosService;
  let prisma: {
    veiculos: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
    };
    situacoes_veiculo: { findUnique: jest.Mock };
    status_viagem: { findMany: jest.Mock };
    viagens: { findFirst: jest.Mock; count: jest.Mock };
  };

  const situacaoFake = (nome: string, id = 1) => ({ id, nome, descricao: null });

  const veiculoFake = (overrides: Record<string, unknown> = {}) => ({
    id: 1,
    placa: 'ABC1D23',
    marca: 'Chevrolet',
    modelo: 'Onix',
    ano_fabricacao: 2024,
    ano_modelo: 2025,
    cor: 'BRANCO',
    renavam: '12345678901',
    odometro_atual: 10000,
    data_aquisicao: new Date('2024-01-15'),
    situacao_id: 1,
    situacao: situacaoFake('ativo'),
    observacoes: null,
    data_hora_criacao: new Date('2026-01-01'),
    data_hora_atualizacao: new Date('2026-01-01'),
    data_hora_exclusao: null,
    ...overrides,
  });

  beforeEach(async () => {
    prisma = {
      veiculos: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
      },
      situacoes_veiculo: { findUnique: jest.fn() },
      status_viagem: { findMany: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]) },
      viagens: { findFirst: jest.fn().mockResolvedValue(null), count: jest.fn().mockResolvedValue(0) },
    };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [VeiculosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = modulo.get(VeiculosService);
  });

  describe('listar', () => {
    it('deve filtrar por placa case-insensitive', async () => {
      prisma.veiculos.findMany.mockResolvedValue([]);
      await service.listar({ placa: 'abc' });
      const arg = prisma.veiculos.findMany.mock.calls[0][0];
      expect(arg.where.placa).toEqual({ contains: 'abc', mode: 'insensitive' });
    });

    it('deve incluir relação situacao no findMany', async () => {
      prisma.veiculos.findMany.mockResolvedValue([]);
      await service.listar({});
      const arg = prisma.veiculos.findMany.mock.calls[0][0];
      expect(arg.include).toEqual({ situacao: true });
    });
  });

  describe('buscarPorId', () => {
    it('deve lançar NotFound quando não existir', async () => {
      prisma.veiculos.findFirst.mockResolvedValue(null);
      await expect(service.buscarPorId(999)).rejects.toThrow(NotFoundException);
    });

    it('deve retornar veículo com situacao expandida (ItemLookup)', async () => {
      prisma.veiculos.findFirst.mockResolvedValue(veiculoFake());
      const r = await service.buscarPorId(1);
      expect(r.placa).toBe('ABC1D23');
      expect(r.situacao).toEqual({ id: 1, nome: 'ativo', descricao: null });
    });
  });

  describe('criar', () => {
    const dtoBase = {
      placa: 'xyz9w88',
      marca: 'Fiat',
      modelo: 'Strada',
      ano_fabricacao: 2024,
      ano_modelo: 2025,
      cor: 'PRATA',
      renavam: '99887766554',
      odometro_atual: 0,
      data_aquisicao: '2024-06-01',
      situacao_id: 1,
    };

    it('deve rejeitar situação inválida', async () => {
      prisma.situacoes_veiculo.findUnique.mockResolvedValue(null);
      await expect(service.criar(dtoBase)).rejects.toThrow(ConflictException);
    });

    it('deve rejeitar placa duplicada', async () => {
      prisma.situacoes_veiculo.findUnique.mockResolvedValue(situacaoFake('ativo'));
      prisma.veiculos.findFirst
        .mockResolvedValueOnce(veiculoFake()) // placa
        .mockResolvedValueOnce(null); // renavam
      await expect(service.criar(dtoBase)).rejects.toThrow(/placa.*j[áa]/i);
    });

    it('deve rejeitar renavam duplicado', async () => {
      prisma.situacoes_veiculo.findUnique.mockResolvedValue(situacaoFake('ativo'));
      prisma.veiculos.findFirst
        .mockResolvedValueOnce(null) // placa
        .mockResolvedValueOnce(veiculoFake()); // renavam
      await expect(service.criar(dtoBase)).rejects.toThrow(/RENAVAM/i);
    });

    it('deve forçar placa maiúscula no save', async () => {
      prisma.situacoes_veiculo.findUnique.mockResolvedValue(situacaoFake('ativo'));
      prisma.veiculos.findFirst.mockResolvedValue(null);
      prisma.veiculos.create.mockResolvedValue(veiculoFake({ placa: 'XYZ9W88' }));

      await service.criar(dtoBase);

      const call = prisma.veiculos.create.mock.calls[0][0];
      expect(call.data.placa).toBe('XYZ9W88');
    });

    it('deve mapear data_aquisicao string → Date', async () => {
      prisma.situacoes_veiculo.findUnique.mockResolvedValue(situacaoFake('ativo'));
      prisma.veiculos.findFirst.mockResolvedValue(null);
      prisma.veiculos.create.mockResolvedValue(veiculoFake());

      await service.criar(dtoBase);

      const call = prisma.veiculos.create.mock.calls[0][0];
      expect(call.data.data_aquisicao).toBeInstanceOf(Date);
    });
  });

  describe('atualizar', () => {
    it('deve lançar NotFound quando id não existir', async () => {
      prisma.veiculos.findFirst.mockResolvedValue(null);
      await expect(service.atualizar(999, { marca: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('deve fazer update parcial (só campos preenchidos)', async () => {
      prisma.veiculos.findFirst.mockResolvedValue(veiculoFake());
      prisma.veiculos.update.mockResolvedValue(veiculoFake({ odometro_atual: 25000 }));

      await service.atualizar(1, { odometro_atual: 25000 });

      const call = prisma.veiculos.update.mock.calls[0][0];
      expect(call.data.odometro_atual).toBe(25000);
      expect(call.data).not.toHaveProperty('marca');
      expect(call.data).not.toHaveProperty('modelo');
    });
  });

  describe('excluir', () => {
    it('deve fazer soft delete', async () => {
      prisma.veiculos.findFirst.mockResolvedValue(veiculoFake());
      prisma.veiculos.update.mockResolvedValue(veiculoFake({ data_hora_exclusao: new Date() }));

      await service.excluir(1);

      const call = prisma.veiculos.update.mock.calls[0][0];
      expect(call.data.data_hora_exclusao).toBeInstanceOf(Date);
    });
  });
});
