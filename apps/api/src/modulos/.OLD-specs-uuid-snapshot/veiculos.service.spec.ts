import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { VeiculosService } from './veiculos.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CriarVeiculoDto, SituacaoVeiculoEnum } from './dto/criar-veiculo.dto';
import { ForbiddenException } from '@nestjs/common';
import { UsuarioJwt } from '@fleetops/types';
import { TipoCombustivelEnum } from '../despesas/dto/criar-despesa.dto';

const mockMotorista: UsuarioJwt = {
  sub: 'uuid-motorista',
  matricula: '0000001234',
  nome: 'Motorista Teste',
  perfil: 'motorista',
  iat: 0,
  exp: 0,
};

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
    viagem: { findFirst: jest.Mock; findMany: jest.Mock };
    despesaVeiculo: { create: jest.Mock };
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
      viagem: { findFirst: jest.fn(), findMany: jest.fn() },
      despesaVeiculo: { create: jest.fn() },
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

  describe('listarDoMotorista', () => {
    it('deve retornar veículos distintos das viagens do motorista', async () => {
      // Arrange
      prisma.viagem.findMany.mockResolvedValue([{ veiculoId: 'uuid-veiculo-1' }]);
      prisma.veiculo.findMany.mockResolvedValue([mockVeiculoPrisma]);

      // Act
      const resultado = await service.listarDoMotorista('uuid-motorista');

      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].placa).toBe('ABC1D23');
    });

    it('deve retornar lista vazia se o motorista não tem viagens', async () => {
      // Arrange
      prisma.viagem.findMany.mockResolvedValue([]);

      // Act
      const resultado = await service.listarDoMotorista('uuid-motorista');

      // Assert
      expect(resultado).toEqual([]);
      expect(prisma.veiculo.findMany).not.toHaveBeenCalled();
    });
  });

  describe('criarAbastecimentoMotorista', () => {
    const dto = {
      valor: 287.5,
      litros: 42.137,
      precoLitro: 6.829,
      tipoCombustivel: TipoCombustivelEnum.GASOLINA,
      odometro: 152340,
    };

    const despesaCriada = {
      id: 'uuid-despesa',
      veiculoId: 'uuid-veiculo-1',
      tipo: 'abastecimento',
      data: new Date('2026-05-19'),
      valor: 287.5,
      litros: 42.137,
      precoLitro: 6.829,
      tipoCombustivel: 'gasolina',
      odometro: 152340,
      descricao: 'Abastecimento',
      dataCriacao: new Date('2026-05-19T10:00:00'),
    };

    it('deve criar abastecimento quando o motorista tem viagem com o veículo', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue({ id: 'uuid-viagem' });
      prisma.veiculo.findFirst.mockResolvedValue({ id: 'uuid-veiculo-1' });
      prisma.despesaVeiculo.create.mockResolvedValue(despesaCriada);

      // Act
      const resultado = await service.criarAbastecimentoMotorista(
        'uuid-veiculo-1',
        dto,
        mockMotorista,
      );

      // Assert
      expect(resultado.tipo).toBe('abastecimento');
      expect(prisma.despesaVeiculo.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar ForbiddenException se o motorista não tem viagem com o veículo', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.criarAbastecimentoMotorista('uuid-veiculo-x', dto, mockMotorista),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException se o veículo não existir', async () => {
      // Arrange
      prisma.viagem.findFirst.mockResolvedValue({ id: 'uuid-viagem' });
      prisma.veiculo.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.criarAbastecimentoMotorista('uuid-veiculo-1', dto, mockMotorista),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
