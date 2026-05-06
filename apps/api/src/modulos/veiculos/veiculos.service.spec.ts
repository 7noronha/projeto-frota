import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { VeiculosService } from './veiculos.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CriarVeiculoDto, SituacaoVeiculoEnum } from './dto/criar-veiculo.dto';

const mockVeiculoPrisma = {
  id: 'uuid-veiculo-1',
  placa: 'ABC1D23',
  marca: 'Toyota',
  modelo: 'Corolla',
  anoFabricacao: 2023,
  anoModelo: 2024,
  cor: 'Branco',
  renavam: '12345678901',
  odometroAtual: 15000,
  dataAquisicao: new Date('2023-06-15'),
  situacao: 'ativo',
  observacoes: null,
  dataCriacao: new Date('2026-01-10T08:00:00'),
};

function mockCriarVeiculoDto(overrides: Partial<CriarVeiculoDto> = {}): CriarVeiculoDto {
  return {
    placa: 'ABC1D23',
    marca: 'Toyota',
    modelo: 'Corolla',
    anoFabricacao: 2023,
    anoModelo: 2024,
    cor: 'Branco',
    renavam: '12345678901',
    odometroAtual: 15000,
    dataAquisicao: '2023-06-15',
    situacao: SituacaoVeiculoEnum.ATIVO,
    ...overrides,
  };
}

describe('VeiculosService', () => {
  let service: VeiculosService;
  let prisma: {
    veiculo: {
      count: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    viagem: { findFirst: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      veiculo: {
        count: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      viagem: { findFirst: jest.fn() },
    };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [VeiculosService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = modulo.get<VeiculosService>(VeiculosService);
  });

  describe('criar', () => {
    it('deve criar veículo com placa em maiúsculas', async () => {
      // Arrange
      prisma.veiculo.findFirst.mockResolvedValue(null);
      prisma.veiculo.create.mockResolvedValue(mockVeiculoPrisma);

      // Act
      const resultado = await service.criar(mockCriarVeiculoDto({ placa: 'abc1d23' }));

      // Assert
      const dadosCreate = prisma.veiculo.create.mock.calls[0][0].data;
      expect(dadosCreate.placa).toBe('ABC1D23');
      expect(resultado.id).toBe('uuid-veiculo-1');
    });

    it('deve lançar ConflictException se placa já existir', async () => {
      // Arrange
      prisma.veiculo.findFirst
        .mockResolvedValueOnce(mockVeiculoPrisma) // placa encontrada
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.criar(mockCriarVeiculoDto())).rejects.toThrow(ConflictException);
    });

    it('deve lançar ConflictException se RENAVAM já existir', async () => {
      // Arrange
      prisma.veiculo.findFirst
        .mockResolvedValueOnce(null) // placa ok
        .mockResolvedValueOnce(mockVeiculoPrisma); // renavam encontrado

      // Act & Assert
      await expect(service.criar(mockCriarVeiculoDto())).rejects.toThrow(ConflictException);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar veículo quando encontrado', async () => {
      // Arrange
      prisma.veiculo.findFirst.mockResolvedValue(mockVeiculoPrisma);

      // Act
      const resultado = await service.buscarPorId('uuid-veiculo-1');

      // Assert
      expect(resultado.placa).toBe('ABC1D23');
      expect(resultado.situacao).toBe('ativo');
    });

    it('deve lançar NotFoundException quando veículo não existe', async () => {
      // Arrange
      prisma.veiculo.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.buscarPorId('uuid-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('excluir', () => {
    it('deve registrar data_exclusao sem deletar o registro', async () => {
      // Arrange
      prisma.veiculo.findFirst.mockResolvedValue(mockVeiculoPrisma);
      prisma.viagem.findFirst.mockResolvedValue(null);
      prisma.veiculo.update.mockResolvedValue({});

      // Act
      await service.excluir('uuid-veiculo-1');

      // Assert
      expect(prisma.veiculo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'uuid-veiculo-1' },
          data: expect.objectContaining({ dataExclusao: expect.any(Date) }),
        }),
      );
    });

    it('deve lançar ConflictException se veículo tiver viagem ativa', async () => {
      // Arrange
      prisma.veiculo.findFirst.mockResolvedValue(mockVeiculoPrisma);
      prisma.viagem.findFirst.mockResolvedValue({ id: 'uuid-viagem', status: 'EM_ANDAMENTO' });

      // Act & Assert
      await expect(service.excluir('uuid-veiculo-1')).rejects.toThrow(ConflictException);
    });

    it('deve lançar NotFoundException ao excluir veículo inexistente', async () => {
      // Arrange
      prisma.veiculo.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.excluir('uuid-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar apenas os campos informados', async () => {
      // Arrange
      prisma.veiculo.findFirst.mockResolvedValue(mockVeiculoPrisma);
      prisma.veiculo.update.mockResolvedValue({ ...mockVeiculoPrisma, cor: 'Prata' });

      // Act
      const resultado = await service.atualizar('uuid-veiculo-1', { cor: 'Prata' });

      // Assert
      expect(resultado.cor).toBe('Prata');
      const dadosUpdate = prisma.veiculo.update.mock.calls[0][0].data;
      expect(dadosUpdate).not.toHaveProperty('placa');
      expect(dadosUpdate).not.toHaveProperty('renavam');
    });
  });
});
