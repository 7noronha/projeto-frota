import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ViagensService } from './viagens.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GeocodingService } from '../../common/geocoding/geocoding.service';
import { CriarViagemDto } from './dto/criar-viagem.dto';
import { UsuarioJwt } from '@fleetops/types';

const mockUsuarioOperador: UsuarioJwt = {
  sub: 'uuid-operador',
  matricula: '0000000002',
  nome: 'Operador',
  perfil: 'operador',
  iat: 0,
  exp: 0,
};

const mockUsuarioMotorista: UsuarioJwt = {
  sub: 'uuid-motorista',
  matricula: '0009003656',
  nome: 'Motorista João',
  perfil: 'motorista',
  iat: 0,
  exp: 0,
};

const mockMotoristaPrisma = {
  id: 'uuid-motorista',
  nome: 'Motorista João',
  matricula: '0009003656',
  perfil: 'motorista',
  ativo: true,
  cnh: '12345678900',
  cnhValidade: new Date('2030-12-31'),
  dataExclusao: null,
};

const mockVeiculoPrisma = {
  id: 'uuid-veiculo',
  placa: 'ABC1D23',
  marca: 'Toyota',
  modelo: 'Corolla',
  odometroAtual: 15000,
  situacao: 'ativo',
  dataExclusao: null,
};

const mockViagem = {
  id: 'uuid-viagem',
  origem: 'Rua da Sede, 1',
  destino: 'Av. Paulista, 1000',
  dataViagem: new Date('2026-05-10'),
  horaInicioPrevista: new Date(0),
  horaFimPrevista: new Date(0),
  dataHoraInicioReal: null,
  dataHoraFimReal: null,
  odometroInicial: null,
  odometroFinal: null,
  distanciaPercorrida: null,
  motoristaId: 'uuid-motorista',
  veiculoId: 'uuid-veiculo',
  operadorCriadorId: 'uuid-operador',
  solicitadoPor: 'Fulano',
  autorizadoPor: 'Ciclano',
  observacoes: null,
  status: 'CRIADA',
  dataCriacao: new Date('2026-04-27T08:00:00'),
  dataExclusao: null,
  motorista: { id: 'uuid-motorista', nome: 'Motorista João', matricula: '0009003656' },
  veiculo: { id: 'uuid-veiculo', placa: 'ABC1D23', marca: 'Toyota', modelo: 'Corolla', odometroAtual: 15000 },
};

function mockCriarDto(overrides: Partial<CriarViagemDto> = {}): CriarViagemDto {
  return {
    destino: 'Av. Paulista, 1000',
    dataViagem: '2026-05-10',
    horaInicioPrevista: '08:00',
    horaFimPrevista: '12:00',
    motoristaId: 'uuid-motorista',
    veiculoId: 'uuid-veiculo',
    solicitadoPor: 'Fulano',
    autorizadoPor: 'Ciclano',
    ...overrides,
  };
}

describe('ViagensService', () => {
  let service: ViagensService;
  let prisma: {
    configuracao: { findFirst: jest.Mock };
    usuario: { findFirst: jest.Mock };
    veiculo: { findFirst: jest.Mock; update: jest.Mock };
    viagem: { count: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      configuracao: { findFirst: jest.fn().mockResolvedValue({ chave: 'endereco_sede', valor: 'Rua da Sede, 1' }) },
      usuario: { findFirst: jest.fn().mockResolvedValue(mockMotoristaPrisma) },
      veiculo: {
        findFirst: jest.fn().mockResolvedValue(mockVeiculoPrisma),
        update: jest.fn(),
      },
      viagem: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(mockViagem),
        update: jest.fn().mockResolvedValue(mockViagem),
      },
      $transaction: jest.fn(),
    };

    const geocodingMock: GeocodingService = {
      geocodificar: jest.fn().mockResolvedValue(null),
    } as unknown as GeocodingService;

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        ViagensService,
        { provide: PrismaService, useValue: prisma },
        { provide: GeocodingService, useValue: geocodingMock },
      ],
    }).compile();

    service = modulo.get<ViagensService>(ViagensService);
  });

  describe('criar', () => {
    it('deve criar uma viagem com status CRIADA', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue(null); // sem conflitos

      // Act
      const resultado = await service.criar(mockCriarDto(), 'uuid-operador');

      // Assert
      expect(resultado.status).toBe('CRIADA');
      expect(resultado.motoristaId).toBe('uuid-motorista');
    });

    it('deve lançar BadRequestException se hora fim <= hora início', async () => {
      // Arrange
      const dto = mockCriarDto({ horaInicioPrevista: '12:00', horaFimPrevista: '08:00' });

      // Act & Assert
      await expect(service.criar(dto, 'uuid-operador')).rejects.toThrow(BadRequestException);
    });

    it('deve lançar NotFoundException se motorista não existir', async () => {
      // Arrange
      prisma.usuario.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.criar(mockCriarDto(), 'uuid-operador')).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se CNH do motorista estiver vencida', async () => {
      // Arrange
      prisma.usuario.findFirst.mockResolvedValue({
        ...mockMotoristaPrisma,
        cnhValidade: new Date('2020-01-01'),
      });

      // Act & Assert
      await expect(service.criar(mockCriarDto(), 'uuid-operador')).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException com horário do conflito se motorista já tiver viagem ativa sobreposta', async () => {
      // Arrange — conflito retorna horario sobreposto
      prisma.viagem.findFirst
        .mockResolvedValueOnce({
          id: 'uuid-conflito',
          horaInicioPrevista: new Date(Date.UTC(1970, 0, 1, 9, 0)),
          horaFimPrevista: new Date(Date.UTC(1970, 0, 1, 11, 0)),
        }) // conflito motorista
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.criar(mockCriarDto(), 'uuid-operador')).rejects.toThrow(
        /Motorista já possui viagem das 09:00 às 11:00/,
      );
    });

    it('deve permitir criação se não houver sobreposição de horário no mesmo dia', async () => {
      // Arrange — sem conflito (buscarConflitoDePeriodo retorna null para ambos)
      prisma.viagem.findFirst.mockResolvedValue(null);

      // Act
      const resultado = await service.criar(mockCriarDto(), 'uuid-operador');

      // Assert
      expect(resultado.status).toBe('CRIADA');
      // Garante que a query usou AND com lt/gt nos horários
      const chamada = prisma.viagem.findFirst.mock.calls[0][0];
      expect(chamada.where.AND).toEqual([
        { horaInicioPrevista: { lt: expect.any(Date) } },
        { horaFimPrevista: { gt: expect.any(Date) } },
      ]);
    });

    it('deve lançar BadRequestException com horário do conflito se veículo já tiver viagem sobreposta', async () => {
      // Arrange — primeiro findFirst sem conflito motorista, segundo retorna conflito veículo
      prisma.viagem.findFirst
        .mockResolvedValueOnce(null) // motorista OK
        .mockResolvedValueOnce({
          id: 'uuid-conflito-veiculo',
          horaInicioPrevista: new Date(Date.UTC(1970, 0, 1, 10, 0)),
          horaFimPrevista: new Date(Date.UTC(1970, 0, 1, 14, 0)),
        });

      // Act & Assert
      await expect(service.criar(mockCriarDto(), 'uuid-operador')).rejects.toThrow(
        /Veículo já possui viagem das 10:00 às 14:00/,
      );
    });

    it('deve lançar NotFoundException se veículo não estiver ativo', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue(null); // sem conflito de motorista
      prisma.veiculo.findFirst.mockResolvedValue(null); // veículo inativo

      // Act & Assert
      await expect(service.criar(mockCriarDto(), 'uuid-operador')).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se motorista não tiver CNH cadastrada', async () => {
      // Arrange
      prisma.usuario.findFirst.mockResolvedValue({ ...mockMotoristaPrisma, cnh: null });

      // Act & Assert
      await expect(service.criar(mockCriarDto(), 'uuid-operador')).rejects.toThrow(
        /CNH cadastrada/,
      );
    });

    it('deve usar cache do endereco_sede em criações subsequentes', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue(null);

      // Act — duas chamadas seguidas
      await service.criar(mockCriarDto(), 'uuid-operador');
      await service.criar(mockCriarDto(), 'uuid-operador');

      // Assert — Configuracao.findFirst só foi chamado UMA vez (cache hit na segunda)
      expect(prisma.configuracao.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('listar', () => {
    it('deve aplicar filtro de motoristaId quando usuário é motorista (forçado)', async () => {
      // Arrange
      prisma.viagem.count.mockResolvedValue(0);
      prisma.viagem.findMany.mockResolvedValue([]);

      // Act
      await service.listar({}, mockUsuarioMotorista);

      // Assert — where inclui motoristaId = sub do motorista logado
      const argsCount = prisma.viagem.count.mock.calls[0][0];
      expect(argsCount.where.motoristaId).toBe('uuid-motorista');
    });

    it('deve retornar paginação correta', async () => {
      // Arrange
      prisma.viagem.count.mockResolvedValue(42);
      prisma.viagem.findMany.mockResolvedValue([mockViagem]);

      // Act
      const resultado = await service.listar({ pagina: 2, tamanhoPagina: 10 }, mockUsuarioOperador);

      // Assert
      expect(resultado.total).toBe(42);
      expect(resultado.pagina).toBe(2);
      expect(resultado.tamanhoPagina).toBe(10);
      expect(resultado.totalPaginas).toBe(5);
    });
  });

  describe('buscarPorId', () => {
    it('deve lançar NotFoundException se viagem não existir', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.buscarPorId('uuid-inexistente', mockUsuarioOperador)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException se motorista tentar acessar viagem de outro', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue({
        ...mockViagem,
        motoristaId: 'uuid-outro-motorista',
      });

      // Act & Assert
      await expect(service.buscarPorId('uuid-viagem', mockUsuarioMotorista)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve fazer backfill de coordenadas quando viagem nao tem lat/lng e geocoding funciona', async () => {
      // Arrange — viagem antiga sem coordenadas (cenário real: criada antes do GPS)
      const viagemSemCoords = {
        ...mockViagem,
        origemLatitude: null,
        origemLongitude: null,
        destinoLatitude: null,
        destinoLongitude: null,
      };
      prisma.viagem.findFirst.mockResolvedValue(viagemSemCoords);

      // Geocoding agora retorna coords para ambos os endereços
      const geocodingService = (service as unknown as { geocoding: GeocodingService }).geocoding;
      (geocodingService.geocodificar as jest.Mock)
        .mockResolvedValueOnce({ latitude: -15.7942, longitude: -47.8822 })
        .mockResolvedValueOnce({ latitude: -23.5505, longitude: -46.6333 });

      prisma.viagem.update.mockResolvedValue({
        ...viagemSemCoords,
        origemLatitude: -15.7942,
        origemLongitude: -47.8822,
        destinoLatitude: -23.5505,
        destinoLongitude: -46.6333,
      });

      // Act
      const resp = await service.buscarPorId('uuid-viagem', mockUsuarioOperador);

      // Assert
      expect(geocodingService.geocodificar).toHaveBeenCalledWith(viagemSemCoords.origem);
      expect(geocodingService.geocodificar).toHaveBeenCalledWith(viagemSemCoords.destino);
      expect(prisma.viagem.update).toHaveBeenCalled();
      expect(resp.origemLatitude).toBe(-15.7942);
      expect(resp.destinoLatitude).toBe(-23.5505);
    });

    it('nao deve persistir nada se backfill nao resolver nenhuma coordenada', async () => {
      // Arrange — viagem sem coords + token Mapbox ausente (geocoding retorna null)
      prisma.viagem.findFirst.mockResolvedValue({
        ...mockViagem,
        origemLatitude: null,
        origemLongitude: null,
        destinoLatitude: null,
        destinoLongitude: null,
      });

      // Act
      const resp = await service.buscarPorId('uuid-viagem', mockUsuarioOperador);

      // Assert
      expect(prisma.viagem.update).not.toHaveBeenCalled();
      expect(resp.origemLatitude).toBeNull();
      expect(resp.destinoLatitude).toBeNull();
    });
  });

  describe('iniciar', () => {
    it('deve iniciar viagem alterando status para EM_ANDAMENTO', async () => {
      // Arrange
      const viagemComVeiculo = {
        ...mockViagem,
        veiculo: { ...mockViagem.veiculo, odometroAtual: 15000 },
      };
      prisma.viagem.findFirst.mockResolvedValue(viagemComVeiculo);
      prisma.viagem.update.mockResolvedValue({ ...mockViagem, status: 'EM_ANDAMENTO', odometroInicial: 15100 });

      // Act
      const resultado = await service.iniciar('uuid-viagem', { odometroInicial: 15100 }, mockUsuarioOperador);

      // Assert
      expect(resultado.status).toBe('EM_ANDAMENTO');
    });

    it('deve lançar BadRequestException se status não for CRIADA', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue({ ...mockViagem, status: 'EM_ANDAMENTO' });

      // Act & Assert
      await expect(
        service.iniciar('uuid-viagem', { odometroInicial: 15100 }, mockUsuarioOperador),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se odômetro inicial for menor que o atual do veículo', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue({
        ...mockViagem,
        veiculo: { ...mockViagem.veiculo, odometroAtual: 16000 },
      });

      // Act & Assert
      await expect(
        service.iniciar('uuid-viagem', { odometroInicial: 15000 }, mockUsuarioOperador),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar ForbiddenException se motorista tentar iniciar viagem de outro motorista', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue({
        ...mockViagem,
        motoristaId: 'uuid-outro-motorista',
        veiculo: { ...mockViagem.veiculo, odometroAtual: 15000 },
      });

      // Act & Assert
      await expect(
        service.iniciar('uuid-viagem', { odometroInicial: 15100 }, mockUsuarioMotorista),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('finalizar', () => {
    it('deve finalizar viagem, calcular distância e atualizar odômetro do veículo', async () => {
      // Arrange
      const viagemEmAndamento = { ...mockViagem, status: 'EM_ANDAMENTO', odometroInicial: 15000 };
      prisma.viagem.findFirst.mockResolvedValue(viagemEmAndamento);
      prisma.$transaction.mockResolvedValue([
        { ...mockViagem, status: 'FINALIZADA', odometroFinal: 15320, distanciaPercorrida: 320 },
        {},
      ]);

      // Act
      const resultado = await service.finalizar('uuid-viagem', { odometroFinal: 15320 }, mockUsuarioOperador);

      // Assert
      expect(resultado.status).toBe('FINALIZADA');
      expect(resultado.distanciaPercorrida).toBe(320);
    });

    it('deve lançar BadRequestException se odômetro final <= inicial', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue({ ...mockViagem, status: 'EM_ANDAMENTO', odometroInicial: 15000 });

      // Act & Assert
      await expect(
        service.finalizar('uuid-viagem', { odometroFinal: 14999 }, mockUsuarioOperador),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se status não for EM_ANDAMENTO', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue({ ...mockViagem, status: 'CRIADA' });

      // Act & Assert
      await expect(
        service.finalizar('uuid-viagem', { odometroFinal: 15500 }, mockUsuarioOperador),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
