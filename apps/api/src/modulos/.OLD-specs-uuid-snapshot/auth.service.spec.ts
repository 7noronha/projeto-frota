import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';

const mockUsuario = {
  id: 'uuid-admin',
  matricula: '0000000001',
  nome: 'Administrador',
  senhaHash: '',
  perfil: 'admin',
  email: null,
  telefone: null,
  cnh: null,
  cnhValidade: null,
  ativo: true,
  dataCriacao: new Date(),
  dataAtualizacao: new Date(),
  dataExclusao: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { usuario: { findFirst: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = { usuario: { findFirst: jest.fn() } };
    jwtService = { sign: jest.fn().mockReturnValue('token-jwt-mock') };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = modulo.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('deve retornar token e dados do usuário com credenciais válidas', async () => {
      // Arrange
      const senhaHash = await bcrypt.hash('MinhaS3nha!', 10);
      prisma.usuario.findFirst.mockResolvedValue({ ...mockUsuario, senhaHash });

      // Act
      const resultado = await service.login({
        matricula: '0000000001',
        senha: 'MinhaS3nha!',
      });

      // Assert
      expect(resultado.token).toBe('token-jwt-mock');
      expect(resultado.usuario.matricula).toBe('0000000001');
      expect(resultado.usuario).not.toHaveProperty('senhaHash');
    });

    it('deve lançar UnauthorizedException para matrícula inexistente', async () => {
      // Arrange
      prisma.usuario.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login({ matricula: '9999999999', senha: 'qualquer123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException para senha incorreta', async () => {
      // Arrange
      const senhaHash = await bcrypt.hash('SenhaCorreta1', 10);
      prisma.usuario.findFirst.mockResolvedValue({ ...mockUsuario, senhaHash });

      // Act & Assert
      await expect(
        service.login({ matricula: '0000000001', senha: 'SenhaErrada1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException para usuário inativo', async () => {
      // Arrange
      const senhaHash = await bcrypt.hash('MinhaS3nha!', 10);
      prisma.usuario.findFirst.mockResolvedValue({ ...mockUsuario, senhaHash, ativo: false });

      // Act & Assert
      await expect(
        service.login({ matricula: '0000000001', senha: 'MinhaS3nha!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('perfil', () => {
    it('deve retornar o payload JWT quando o usuário existe e está ativo', async () => {
      // Arrange
      prisma.usuario.findFirst.mockResolvedValue(mockUsuario);
      const payload = {
        sub: 'uuid-admin',
        matricula: '0000000001',
        nome: 'Administrador',
        perfil: 'admin' as const,
        iat: 0,
        exp: 0,
      };

      // Act
      const resultado = await service.perfil(payload);

      // Assert
      expect(resultado).toEqual(payload);
    });

    it('deve lançar UnauthorizedException quando usuário não existe mais', async () => {
      // Arrange
      prisma.usuario.findFirst.mockResolvedValue(null);
      const payload = {
        sub: 'uuid-inexistente',
        matricula: '9999999999',
        nome: 'Inexistente',
        perfil: 'admin' as const,
        iat: 0,
        exp: 0,
      };

      // Act & Assert
      await expect(service.perfil(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
