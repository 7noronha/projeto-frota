import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfiguracoesService } from './configuracoes.service';
import { PrismaService } from '../../common/prisma/prisma.service';

const mockConfig = {
  chave: 'endereco_sede',
  valor: 'AV PAULISTA 1000 - SAO PAULO/SP',
  dataAtualizacao: new Date('2026-05-20T10:00:00'),
};

describe('ConfiguracoesService', () => {
  let service: ConfiguracoesService;
  let prisma: {
    configuracao: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      configuracao: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [ConfiguracoesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = modulo.get<ConfiguracoesService>(ConfiguracoesService);
  });

  describe('listar', () => {
    it('deve retornar todas as configuracoes ordenadas por chave', async () => {
      prisma.configuracao.findMany.mockResolvedValue([mockConfig]);
      const r = await service.listar();
      expect(prisma.configuracao.findMany).toHaveBeenCalledWith({ orderBy: { chave: 'asc' } });
      expect(r).toHaveLength(1);
      expect(r[0]).toMatchObject({ chave: 'endereco_sede' });
    });

    it('deve retornar lista vazia quando nao houver configuracoes', async () => {
      prisma.configuracao.findMany.mockResolvedValue([]);
      const r = await service.listar();
      expect(r).toEqual([]);
    });
  });

  describe('buscarPorChave', () => {
    it('deve retornar a configuracao quando existir', async () => {
      prisma.configuracao.findFirst.mockResolvedValue(mockConfig);
      const r = await service.buscarPorChave('endereco_sede');
      expect(r.valor).toBe(mockConfig.valor);
    });

    it('deve lancar NotFound quando nao existir', async () => {
      prisma.configuracao.findFirst.mockResolvedValue(null);
      await expect(service.buscarPorChave('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar o valor de uma configuracao existente', async () => {
      prisma.configuracao.findFirst.mockResolvedValue(mockConfig);
      const atualizada = { ...mockConfig, valor: 'AV NOVA SEDE 200' };
      prisma.configuracao.update.mockResolvedValue(atualizada);

      const r = await service.atualizar('endereco_sede', { valor: 'AV NOVA SEDE 200' });
      expect(prisma.configuracao.update).toHaveBeenCalledWith({
        where: { chave: 'endereco_sede' },
        data: { valor: 'AV NOVA SEDE 200' },
      });
      expect(r.valor).toBe('AV NOVA SEDE 200');
    });

    it('deve lancar NotFound quando a chave nao existir', async () => {
      prisma.configuracao.findFirst.mockResolvedValue(null);
      await expect(
        service.atualizar('nao_existe', { valor: 'x' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.configuracao.update).not.toHaveBeenCalled();
    });
  });
});
