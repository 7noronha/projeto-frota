import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracoesService } from './configuracoes.service';
import { PrismaService } from '../../common/prisma/prisma.service';

// Skeleton — validação básica. Spec UUID-era arquivada em .OLD-specs-uuid-snapshot/.
describe('ConfiguracoesService', () => {
  let service: ConfiguracoesService;
  let prisma: { configuracoes: { findUnique: jest.Mock; upsert: jest.Mock } };

  beforeEach(async () => {
    prisma = { configuracoes: { findUnique: jest.fn(), upsert: jest.fn() } };
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [ConfiguracoesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = modulo.get(ConfiguracoesService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });
});
