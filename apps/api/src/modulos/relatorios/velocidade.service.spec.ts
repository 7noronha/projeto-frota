import { Test, TestingModule } from '@nestjs/testing';
import { VelocidadeService } from './velocidade.service';
import { PrismaService } from '../../common/prisma/prisma.service';

// Skeleton — validação básica. Spec UUID-era arquivada em .OLD-specs-uuid-snapshot/.
describe('VelocidadeService', () => {
  let service: VelocidadeService;

  beforeEach(async () => {
    const prisma = {
      status_viagem: { findUnique: jest.fn().mockResolvedValue({ id: 3, nome: 'FINALIZADA' }) },
      viagens: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [VelocidadeService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = modulo.get(VelocidadeService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });
});
