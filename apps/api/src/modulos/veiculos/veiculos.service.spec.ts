import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VeiculosService } from './veiculos.service';
import { PrismaService } from '../../common/prisma/prisma.service';

// Skeleton — validação básica. Spec UUID-era arquivada em .OLD-specs-uuid-snapshot/.
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
    situacoes_veiculo: { findUnique: jest.Mock; findFirst: jest.Mock };
  };

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
      situacoes_veiculo: { findUnique: jest.fn(), findFirst: jest.fn() },
    };
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [VeiculosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = modulo.get(VeiculosService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar NotFound ao buscar id inexistente', async () => {
    prisma.veiculos.findFirst.mockResolvedValue(null);
    await expect(service.buscarPorId(999)).rejects.toThrow(NotFoundException);
  });
});
