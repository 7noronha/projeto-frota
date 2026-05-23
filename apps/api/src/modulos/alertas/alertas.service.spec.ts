import { Test, TestingModule } from '@nestjs/testing';
import { AlertasService } from './alertas.service';
import { PrismaService } from '../../common/prisma/prisma.service';

// Skeleton — validação básica. Spec UUID-era arquivada em .OLD-specs-uuid-snapshot/.
describe('AlertasService', () => {
  let service: AlertasService;

  beforeEach(async () => {
    const prisma = {
      perfis_usuario: { findUnique: jest.fn().mockResolvedValue({ id: 1, nome: 'motorista' }) },
      situacoes_veiculo: { findUnique: jest.fn().mockResolvedValue({ id: 1, nome: 'ativo' }) },
      status_viagem: { findUnique: jest.fn().mockResolvedValue({ id: 1, nome: 'EM_ANDAMENTO' }) },
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

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar array vazio quando não há dados', async () => {
    const alertas = await service.listar();
    expect(alertas).toEqual([]);
  });
});
