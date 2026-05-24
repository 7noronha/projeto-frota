import { Test, TestingModule } from '@nestjs/testing';
import { RelatoriosService } from './relatorios.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('RelatoriosService', () => {
  let service: RelatoriosService;
  let prisma: { viagem: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { viagem: { findMany: jest.fn() } };
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [RelatoriosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = modulo.get<RelatoriosService>(RelatoriosService);
  });

  describe('distanciaPorMotorista', () => {
    it('deve agregar km e viagens por motorista e ordenar do maior para o menor', async () => {
      prisma.viagem.findMany.mockResolvedValue([
        {
          motoristaId: 'm1',
          distanciaPercorrida: 120,
          motorista: { nome: 'JOAO', matricula: '0000001234' },
        },
        {
          motoristaId: 'm1',
          distanciaPercorrida: 80,
          motorista: { nome: 'JOAO', matricula: '0000001234' },
        },
        {
          motoristaId: 'm2',
          distanciaPercorrida: 300,
          motorista: { nome: 'MARIA', matricula: '0000005678' },
        },
      ]);

      const r = await service.distanciaPorMotorista({});

      expect(r).toHaveLength(2);
      expect(r[0]).toMatchObject({
        motoristaId: 'm2',
        nome: 'MARIA',
        totalKm: 300,
        totalViagens: 1,
      });
      expect(r[1]).toMatchObject({
        motoristaId: 'm1',
        nome: 'JOAO',
        totalKm: 200,
        totalViagens: 2,
      });
    });

    it('deve filtrar pelo periodo informado', async () => {
      prisma.viagem.findMany.mockResolvedValue([]);
      await service.distanciaPorMotorista({
        dataInicio: '2026-05-01',
        dataFim: '2026-05-31',
      });
      expect(prisma.viagem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'FINALIZADA',
            dataExclusao: null,
            dataViagem: { gte: new Date('2026-05-01'), lte: new Date('2026-05-31') },
          }),
        }),
      );
    });

    it('deve retornar lista vazia quando nao houver viagens finalizadas', async () => {
      prisma.viagem.findMany.mockResolvedValue([]);
      const r = await service.distanciaPorMotorista({});
      expect(r).toEqual([]);
    });

    it('deve tratar distanciaPercorrida nula como zero', async () => {
      prisma.viagem.findMany.mockResolvedValue([
        {
          motoristaId: 'm1',
          distanciaPercorrida: null,
          motorista: { nome: 'JOAO', matricula: '0000001234' },
        },
      ]);
      const r = await service.distanciaPorMotorista({});
      expect(r[0]?.totalKm).toBe(0);
    });
  });

  describe('distanciaPorVeiculo', () => {
    it('deve agregar km e viagens por veiculo e ordenar', async () => {
      prisma.viagem.findMany.mockResolvedValue([
        {
          veiculoId: 'v1',
          distanciaPercorrida: 50,
          veiculo: { placa: 'ABC1D23', marca: 'Toyota', modelo: 'Corolla' },
        },
        {
          veiculoId: 'v2',
          distanciaPercorrida: 200,
          veiculo: { placa: 'DEF2E34', marca: 'Honda', modelo: 'Civic' },
        },
        {
          veiculoId: 'v1',
          distanciaPercorrida: 100,
          veiculo: { placa: 'ABC1D23', marca: 'Toyota', modelo: 'Corolla' },
        },
      ]);

      const r = await service.distanciaPorVeiculo({});
      expect(r).toHaveLength(2);
      expect(r[0]).toMatchObject({ veiculoId: 'v2', totalKm: 200, totalViagens: 1 });
      expect(r[1]).toMatchObject({ veiculoId: 'v1', totalKm: 150, totalViagens: 2 });
    });

    it('deve aplicar apenas dataInicio quando dataFim ausente', async () => {
      prisma.viagem.findMany.mockResolvedValue([]);
      await service.distanciaPorVeiculo({ dataInicio: '2026-01-01' });
      expect(prisma.viagem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dataViagem: { gte: new Date('2026-01-01') },
          }),
        }),
      );
    });
  });
});
