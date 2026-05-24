import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CriarUsuarioDto, PerfilEnum } from './dto/criar-usuario.dto';

const mockUsuarioPrisma = {
  id: 'uuid-123',
  matricula: '0009003656',
  nome: 'João Silva',
  perfil: 'operador',
  email: null,
  telefone: null,
  cnh: null,
  cnhValidade: null,
  ativo: true,
  dataCriacao: new Date('2026-04-01T10:00:00'),
};

function mockCriarUsuarioDto(overrides: Partial<CriarUsuarioDto> = {}): CriarUsuarioDto {
  return {
    matricula: '0009003656',
    nome: 'João Silva',
    senha: 'MinhaS3nha!',
    perfil: PerfilEnum.OPERADOR,
    ...overrides,
  };
}

describe('UsuariosService', () => {
  let service: UsuariosService;
  let prisma: {
    usuario: {
      count: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      usuario: {
        count: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = modulo.get<UsuariosService>(UsuariosService);
  });

  describe('criar', () => {
    it('deve criar um usuário com a senha hasheada e não retornar senhaHash', async () => {
      // Arrange
      prisma.usuario.findFirst.mockResolvedValue(null);
      prisma.usuario.create.mockResolvedValue(mockUsuarioPrisma);

      // Act
      const resultado = await service.criar(mockCriarUsuarioDto());

      // Assert
      expect(resultado.matricula).toBe('0009003656');
      expect(resultado).not.toHaveProperty('senhaHash');
      const dadosCreate = prisma.usuario.create.mock.calls[0][0].data;
      expect(dadosCreate.senhaHash).toBeDefined();
      expect(dadosCreate.senhaHash).not.toBe('MinhaS3nha!');
    });

    it('deve lançar ConflictException se matrícula já existir', async () => {
      // Arrange
      prisma.usuario.findFirst.mockResolvedValue(mockUsuarioPrisma);

      // Act & Assert
      await expect(service.criar(mockCriarUsuarioDto())).rejects.toThrow(ConflictException);
    });

    it('deve lançar BadRequestException ao criar motorista sem CNH', async () => {
      // Arrange
      prisma.usuario.findFirst.mockResolvedValue(null);
      const dto = mockCriarUsuarioDto({ perfil: PerfilEnum.MOTORISTA, cnh: undefined });

      // Act & Assert
      await expect(service.criar(dto)).rejects.toThrow(BadRequestException);
    });

    it('deve criar motorista com CNH válida', async () => {
      // Arrange
      const motoristaMock = {
        ...mockUsuarioPrisma,
        perfil: 'motorista',
        cnh: '12345678900',
        cnhValidade: new Date('2028-12-31'),
      };
      prisma.usuario.findFirst.mockResolvedValue(null);
      prisma.usuario.create.mockResolvedValue(motoristaMock);
      const dto = mockCriarUsuarioDto({
        perfil: PerfilEnum.MOTORISTA,
        cnh: '12345678900',
        cnhValidade: '2028-12-31',
      });

      // Act
      const resultado = await service.criar(dto);

      // Assert
      expect(resultado.perfil).toBe('motorista');
      expect(resultado.cnh).toBe('12345678900');
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar usuário quando encontrado', async () => {
      // Arrange
      prisma.usuario.findFirst.mockResolvedValue(mockUsuarioPrisma);

      // Act
      const resultado = await service.buscarPorId('uuid-123');

      // Assert
      expect(resultado.id).toBe('uuid-123');
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      // Arrange
      prisma.usuario.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.buscarPorId('uuid-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('inativar', () => {
    it('deve marcar ativo=false sem definir data_exclusao (inativar é diferente de excluir)', async () => {
      // Arrange
      prisma.usuario.findFirst.mockResolvedValue(mockUsuarioPrisma);
      prisma.usuario.update.mockResolvedValue({});

      // Act
      await service.inativar('uuid-123');

      // Assert — apenas ativo: false, sem dataExclusao
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: { ativo: false },
      });
    });

    it('deve lançar NotFoundException ao inativar usuário inexistente', async () => {
      // Arrange
      prisma.usuario.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.inativar('uuid-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('registrarPushToken', () => {
    it('deve persistir o token quando informado', async () => {
      await service.registrarPushToken('uuid-user', 'ExponentPushToken[abc]');
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'uuid-user' },
        data: { expoPushToken: 'ExponentPushToken[abc]' },
      });
    });

    it('deve gravar null quando token vier vazio (desregistro)', async () => {
      await service.registrarPushToken('uuid-user', '');
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'uuid-user' },
        data: { expoPushToken: null },
      });
    });

    it('deve gravar null quando token vier null', async () => {
      await service.registrarPushToken('uuid-user', null);
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'uuid-user' },
        data: { expoPushToken: null },
      });
    });
  });
});
