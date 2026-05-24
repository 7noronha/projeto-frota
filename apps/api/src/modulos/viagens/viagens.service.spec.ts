import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ViagensService } from './viagens.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PushNotificationService } from '../../common/notificacoes/push-notification.service';
import { GeocodingService } from '../../common/geocoding/geocoding.service';
import { DirectionsService } from '../../common/geocoding/directions.service';
import { VelocidadeService } from '../relatorios/velocidade.service';
import type { UsuarioJwt } from '@fleetops/types';

describe('ViagensService', () => {
  let service: ViagensService;
  let prisma: {
    viagens: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
    veiculos: { findFirst: jest.Mock; update: jest.Mock };
    usuarios: { findFirst: jest.Mock };
    status_viagem: { findUnique: jest.Mock; findMany: jest.Mock };
    posicoes_viagem: { findMany: jest.Mock; create: jest.Mock };
    $transaction: jest.Mock;
  };

  const statusIdMap: Record<string, number> = {
    CRIADA: 1,
    EM_ANDAMENTO: 2,
    FINALIZADA: 3,
  };

  const usuarioJwt = (perfil: string, sub = 10): UsuarioJwt => ({
    sub,
    matricula: '0000000010',
    nome: 'Operador',
    perfil,
    iat: 0,
    exp: 0,
  });

  const viagemFake = (statusNome: string, overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    id: 1,
    origem: 'Sede',
    destino: 'Cliente',
    origem_latitude: null,
    origem_longitude: null,
    destino_latitude: null,
    destino_longitude: null,
    rota_geometria: null,
    rota_distancia_km: null,
    rota_duracao_min: null,
    data_viagem: new Date('2026-12-01'),
    hora_inicio_prevista: new Date('1970-01-01T08:00:00Z'),
    hora_fim_prevista: new Date('1970-01-01T18:00:00Z'),
    data_hora_inicio_real: null,
    data_hora_fim_real: null,
    odometro_inicial: null,
    odometro_final: null,
    distancia_percorrida: null,
    motorista_id: 100,
    veiculo_id: 200,
    operador_criador_id: 10,
    solicitado_por: 'RH',
    autorizado_por: 'Gerência',
    observacoes: null,
    status_id: statusIdMap[statusNome],
    data_hora_criacao: new Date(),
    data_hora_atualizacao: new Date(),
    data_hora_exclusao: null,
    motorista: { id: 100, nome: 'Motorista', matricula: '0000000100' },
    veiculo: { id: 200, placa: 'TST1A23', marca: 'Fiat', modelo: 'Strada', odometro_atual: 10000 },
    status: { id: statusIdMap[statusNome], nome: statusNome, descricao: null },
    ...overrides,
  });

  beforeEach(async () => {
    prisma = {
      viagens: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn(),
        create: jest.fn(),
      },
      veiculos: { findFirst: jest.fn(), update: jest.fn() },
      usuarios: { findFirst: jest.fn() },
      status_viagem: {
        findUnique: jest.fn().mockImplementation(({ where: { nome } }: { where: { nome: string } }) =>
          Promise.resolve({ id: statusIdMap[nome], nome, descricao: null }),
        ),
        findMany: jest.fn().mockResolvedValue([]),
      },
      posicoes_viagem: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn() },
      $transaction: jest.fn().mockImplementation((promises: Promise<unknown>[]) => Promise.all(promises)),
    };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        ViagensService,
        { provide: PrismaService, useValue: prisma },
        { provide: PushNotificationService, useValue: { enviarParaUsuario: jest.fn() } },
        { provide: GeocodingService, useValue: { geocodificar: jest.fn() } },
        { provide: DirectionsService, useValue: { calcularRota: jest.fn() } },
        { provide: VelocidadeService, useValue: { calcularMedia: jest.fn(), invalidar: jest.fn() } },
      ],
    }).compile();
    service = modulo.get(ViagensService);
  });

  describe('iniciar', () => {
    it('deve transicionar CRIADA → EM_ANDAMENTO com odômetro válido', async () => {
      prisma.viagens.findFirst.mockResolvedValue(viagemFake('CRIADA'));
      prisma.viagens.update.mockResolvedValue(
        viagemFake('EM_ANDAMENTO', { odometro_inicial: 10500, data_hora_inicio_real: new Date() }),
      );

      const r = await service.iniciar(1, { odometro_inicial: 10500 }, usuarioJwt('motorista', 100));

      expect(prisma.viagens.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status_id: statusIdMap['EM_ANDAMENTO'],
            odometro_inicial: 10500,
            data_hora_inicio_real: expect.any(Date),
          }),
        }),
      );
      expect(r.status.nome).toBe('EM_ANDAMENTO');
    });

    it('deve lançar NotFound quando viagem não existe', async () => {
      prisma.viagens.findFirst.mockResolvedValue(null);
      await expect(
        service.iniciar(999, { odometro_inicial: 10500 }, usuarioJwt('admin')),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve rejeitar quando status não for CRIADA', async () => {
      prisma.viagens.findFirst.mockResolvedValue(viagemFake('EM_ANDAMENTO'));
      await expect(
        service.iniciar(1, { odometro_inicial: 10500 }, usuarioJwt('admin')),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve rejeitar motorista tentando iniciar viagem de outro motorista', async () => {
      prisma.viagens.findFirst.mockResolvedValue(viagemFake('CRIADA', { motorista_id: 100 }));
      await expect(
        service.iniciar(1, { odometro_inicial: 10500 }, usuarioJwt('motorista', 999)),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve rejeitar odômetro inicial menor que o atual do veículo', async () => {
      prisma.viagens.findFirst.mockResolvedValue(viagemFake('CRIADA'));
      await expect(
        service.iniciar(1, { odometro_inicial: 5000 }, usuarioJwt('admin')),
      ).rejects.toThrow(/odômetro inicial/i);
    });
  });

  describe('finalizar', () => {
    it('deve transicionar EM_ANDAMENTO → FINALIZADA calculando distância', async () => {
      prisma.viagens.findFirst.mockResolvedValue(
        viagemFake('EM_ANDAMENTO', {
          odometro_inicial: 10500,
          data_hora_inicio_real: new Date('2026-01-01T08:00:00Z'),
        }),
      );
      prisma.viagens.update.mockResolvedValue(
        viagemFake('FINALIZADA', {
          odometro_inicial: 10500,
          odometro_final: 10800,
          distancia_percorrida: 300,
        }),
      );

      const r = await service.finalizar(1, { odometro_final: 10800 }, usuarioJwt('motorista', 100));

      expect(prisma.viagens.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status_id: statusIdMap['FINALIZADA'],
            odometro_final: 10800,
            distancia_percorrida: 300,
          }),
        }),
      );
      expect(r.status.nome).toBe('FINALIZADA');
    });

    it('deve rejeitar finalizar viagem que não está EM_ANDAMENTO', async () => {
      prisma.viagens.findFirst.mockResolvedValue(viagemFake('CRIADA'));
      await expect(
        service.finalizar(1, { odometro_final: 10800 }, usuarioJwt('admin')),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve rejeitar odômetro final menor ou igual ao inicial', async () => {
      prisma.viagens.findFirst.mockResolvedValue(
        viagemFake('EM_ANDAMENTO', { odometro_inicial: 10500 }),
      );
      await expect(
        service.finalizar(1, { odometro_final: 10500 }, usuarioJwt('admin')),
      ).rejects.toThrow(/odômetro final/i);
    });

    it('deve rejeitar motorista finalizando viagem de outro motorista', async () => {
      prisma.viagens.findFirst.mockResolvedValue(
        viagemFake('EM_ANDAMENTO', { motorista_id: 100, odometro_inicial: 10500 }),
      );
      await expect(
        service.finalizar(1, { odometro_final: 10800 }, usuarioJwt('motorista', 999)),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('listar', () => {
    it('motorista deve receber apenas suas próprias viagens (filtro forçado)', async () => {
      prisma.viagens.findMany.mockResolvedValue([]);
      prisma.viagens.count.mockResolvedValue(0);

      await service.listar({}, usuarioJwt('motorista', 100));

      expect(prisma.viagens.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ motorista_id: 100, data_hora_exclusao: null }),
        }),
      );
    });

    it('admin deve poder listar sem filtro de motorista', async () => {
      prisma.viagens.findMany.mockResolvedValue([]);
      prisma.viagens.count.mockResolvedValue(0);

      await service.listar({}, usuarioJwt('admin'));

      const callArg = prisma.viagens.findMany.mock.calls[0][0];
      expect(callArg.where.motorista_id).toBeUndefined();
    });
  });
});
