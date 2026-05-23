import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    usuarios: { findFirst: jest.Mock; update: jest.Mock };
  };
  let jwt: { sign: jest.Mock };

  const usuarioFake = (overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> => ({
    id: 1,
    matricula: '0000000001',
    nome: 'Admin Teste',
    senha_hash: bcrypt.hashSync('Senha@123', 10),
    perfil_id: 1,
    perfil: { id: 1, nome: 'admin', descricao: null },
    email: 'admin@fleetops.local',
    telefone: null,
    cnh: null,
    cnh_validade: null,
    ativo: true,
    data_hora_criacao: new Date('2026-01-01T12:00:00Z'),
    ...overrides,
  });

  beforeEach(async () => {
    prisma = { usuarios: { findFirst: jest.fn(), update: jest.fn() } };
    jwt = { sign: jest.fn().mockReturnValue('jwt.fake.token') };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = modulo.get(AuthService);
  });

  describe('login', () => {
    it('deve retornar token + dados do usuário com credenciais válidas', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(usuarioFake());

      const r = await service.login({ matricula: '0000000001', senha: 'Senha@123' });

      expect(r.token).toBe('jwt.fake.token');
      expect(r.usuario).toEqual({
        id: 1,
        matricula: '0000000001',
        nome: 'Admin Teste',
        perfil: 'admin',
      });
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 1,
        matricula: '0000000001',
        nome: 'Admin Teste',
        perfil: 'admin',
      });
    });

    it('deve lançar Unauthorized quando matrícula não existir', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(null);
      await expect(service.login({ matricula: '0000000099', senha: 'qualquer' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar Unauthorized quando senha está incorreta', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(usuarioFake());
      await expect(service.login({ matricula: '0000000001', senha: 'errada' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar Unauthorized quando usuário está inativo', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(usuarioFake({ ativo: false }));
      await expect(service.login({ matricula: '0000000001', senha: 'Senha@123' })).rejects.toThrow(
        /inativo/i,
      );
    });

    it('deve ignorar usuários com data_hora_exclusao definida (filtro no where)', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(null);
      await service.login({ matricula: '0000000001', senha: 'x' }).catch(() => undefined);
      expect(prisma.usuarios.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ data_hora_exclusao: null }),
        }),
      );
    });
  });

  describe('atualizarMeuPerfil', () => {
    const jwtFake = { sub: 1, matricula: '0000000001', nome: 'Admin', perfil: 'admin', iat: 0, exp: 0 };

    it('deve atualizar email e telefone sem senha', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(usuarioFake());
      prisma.usuarios.update.mockResolvedValue(usuarioFake({ email: 'novo@x.com', telefone: '11999998888' }));

      const r = await service.atualizarMeuPerfil(jwtFake, {
        email: 'novo@x.com',
        telefone: '11999998888',
      });

      expect(r.email).toBe('novo@x.com');
      expect(r.telefone).toBe('11999998888');
      expect(prisma.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ senha_hash: expect.anything() }),
        }),
      );
    });

    it('deve exigir senha atual ao trocar senha', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(usuarioFake());
      await expect(
        service.atualizarMeuPerfil(jwtFake, { novaSenha: 'NovaSenha@456' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve rejeitar troca de senha com senha atual incorreta', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(usuarioFake());
      await expect(
        service.atualizarMeuPerfil(jwtFake, {
          senhaAtual: 'errada',
          novaSenha: 'NovaSenha@456',
        }),
      ).rejects.toThrow(/senha atual incorreta/i);
    });

    it('deve trocar senha quando atual está correta', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(usuarioFake());
      prisma.usuarios.update.mockResolvedValue(usuarioFake());

      await service.atualizarMeuPerfil(jwtFake, {
        senhaAtual: 'Senha@123',
        novaSenha: 'NovaSenha@456',
      });

      expect(prisma.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ senha_hash: expect.any(String) }),
        }),
      );
    });
  });
});
