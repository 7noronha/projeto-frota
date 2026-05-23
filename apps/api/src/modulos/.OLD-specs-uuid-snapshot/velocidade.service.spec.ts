import { Test, TestingModule } from '@nestjs/testing';
import { VelocidadeService } from './velocidade.service';
import { PrismaService } from '../../common/prisma/prisma.service';

function viagemMock(distanciaPercorrida: number, horasReais: number) {
  const fim = new Date('2026-05-21T12:00:00');
  const inicio = new Date(fim.getTime() - horasReais * 60 * 60 * 1000);
  return {
    distanciaPercorrida,
    dataHoraInicioReal: inicio,
    dataHoraFimReal: fim,
  };
}

describe('VelocidadeService', () => {
  let service: VelocidadeService;
  let prisma: { viagem: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { viagem: { findMany: jest.fn() } };
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [VelocidadeService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = modulo.get<VelocidadeService>(VelocidadeService);
  });

  describe('porMotorista', () => {
    it('deve devolver fallback 40 km/h quando nao ha viagens', async () => {
      prisma.viagem.findMany.mockResolvedValue([]);
      const r = await service.porMotorista('m1');
      expect(r.velocidadeMediaKmH).toBe(40);
      expect(r.amostras).toBe(0);
    });

    it('deve devolver fallback quando ha menos de 3 amostras', async () => {
      prisma.viagem.findMany.mockResolvedValue([viagemMock(100, 1.5), viagemMock(60, 1)]);
      const r = await service.porMotorista('m1');
      expect(r.velocidadeMediaKmH).toBe(40);
    });

    it('deve calcular a media com >=3 amostras', async () => {
      // 3 viagens: 90km/1.5h = 60, 60km/1h = 60, 120km/2h = 60 -> media 60
      prisma.viagem.findMany.mockResolvedValue([
        viagemMock(90, 1.5),
        viagemMock(60, 1),
        viagemMock(120, 2),
      ]);
      const r = await service.porMotorista('m1');
      expect(r.velocidadeMediaKmH).toBe(60);
      expect(r.amostras).toBe(3);
    });

    it('deve travar entre 10 e 120 km/h (proteção contra dados absurdos)', async () => {
      // 3 viagens com velocidade muito alta (200+)
      prisma.viagem.findMany.mockResolvedValue([
        viagemMock(400, 1),
        viagemMock(500, 1),
        viagemMock(600, 1),
      ]);
      const r = await service.porMotorista('m1');
      expect(r.velocidadeMediaKmH).toBe(120);
    });

    it('deve ignorar viagens com horas <= 0 ou > 24', async () => {
      prisma.viagem.findMany.mockResolvedValue([
        viagemMock(60, 1),
        viagemMock(60, 1),
        viagemMock(60, 1),
        viagemMock(60, 25), // ignorada
        viagemMock(60, 0), // ignorada (horas <=0)
      ]);
      const r = await service.porMotorista('m1');
      expect(r.velocidadeMediaKmH).toBe(60);
    });

    it('deve cachear o resultado por motorista', async () => {
      prisma.viagem.findMany.mockResolvedValue([]);
      await service.porMotorista('m1');
      await service.porMotorista('m1');
      expect(prisma.viagem.findMany).toHaveBeenCalledTimes(1);
    });

    it('deve invalidar o cache quando solicitado', async () => {
      prisma.viagem.findMany.mockResolvedValue([]);
      await service.porMotorista('m1');
      service.invalidar('m1');
      await service.porMotorista('m1');
      expect(prisma.viagem.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('global', () => {
    it('deve calcular media com viagens recentes', async () => {
      prisma.viagem.findMany.mockResolvedValue([
        viagemMock(50, 1),
        viagemMock(60, 1.2),
        viagemMock(80, 1.6),
      ]);
      const r = await service.global();
      // 50+60+80=190, 1+1.2+1.6=3.8, 190/3.8=50
      expect(r.velocidadeMediaKmH).toBeCloseTo(50, 1);
      expect(r.motoristaId).toBeNull();
    });
  });
});
