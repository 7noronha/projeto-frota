import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { PrismaService } from '../../common/prisma/prisma.service';

// Skeleton — validação básica. Spec UUID-era arquivada em .OLD-specs-uuid-snapshot/.
describe('UsuariosService', () => {
  let service: UsuariosService;
  let prisma: {
    usuarios: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
    };
    perfis_usuario: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      usuarios: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
      },
      perfis_usuario: { findUnique: jest.fn() },
    };
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [UsuariosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = modulo.get(UsuariosService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar NotFound ao buscar id inexistente', async () => {
    prisma.usuarios.findFirst.mockResolvedValue(null);
    await expect(service.buscarPorId(999)).rejects.toThrow(NotFoundException);
  });
});
