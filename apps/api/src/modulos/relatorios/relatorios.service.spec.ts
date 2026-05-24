import { Test, TestingModule } from '@nestjs/testing';
import { RelatoriosService } from './relatorios.service';
import { PrismaService } from '../../common/prisma/prisma.service';

// Skeleton — validação básica. Spec UUID-era arquivada em .OLD-specs-uuid-snapshot/.
describe('RelatoriosService', () => {
  let service: RelatoriosService;

  beforeEach(async () => {
    const prisma = {
      status_viagem: { findUnique: jest.fn().mockResolvedValue({ id: 3, nome: 'FINALIZADA' }) },
      viagens: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [RelatoriosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = modulo.get(RelatoriosService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar array vazio em distancia por motorista sem dados', async () => {
    const result = await service.distanciaPorMotorista({});
    expect(result).toEqual([]);
  });
});
