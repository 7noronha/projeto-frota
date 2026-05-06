import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ViagensService } from './viagens.service';
import { PrismaService } from '../../common/prisma/prisma.service';
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

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [ViagensService, { provide: PrismaService, useValue: prisma }],
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

    it('deve lançar BadRequestException se motorista já tiver viagem ativa na data', async () => {
      // Arrange
      prisma.viagem.findFirst
        .mockResolvedValueOnce({ id: 'uuid-conflito', status: 'CRIADA' }) // conflito motorista
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.criar(mockCriarDto(), 'uuid-operador')).rejects.toThrow(BadRequestException);
    });

    it('deve lançar NotFoundException se veículo não estiver ativo', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue(null); // sem conflito de motorista
      prisma.veiculo.findFirst.mockResolvedValue(null); // veículo inativo

      // Act & Assert
      await expect(service.criar(mockCriarDto(), 'uuid-operador')).rejects.toThrow(NotFoundException);
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
