import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let prisma: {
    usuarios: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
    };
    perfis_usuario: { findUnique: jest.Mock };
  };

  const perfilFake = (nome: string, id = 1) => ({ id, nome, descricao: null });

  const usuarioFake = (overrides: Record<string, unknown> = {}) => ({
    id: 1,
    matricula: '0000000010',
    nome: 'Usuário Teste',
    senha_hash: 'hash-fake',
    perfil_id: 4,
    perfil: perfilFake('operador', 4),
    email: null,
    telefone: null,
    cnh: null,
    cnh_validade: null,
    ativo: true,
    data_hora_criacao: new Date('2026-05-01T12:00:00Z'),
    data_hora_atualizacao: new Date('2026-05-01T12:00:00Z'),
    data_hora_exclusao: null,
    ...overrides,
  });

  beforeEach(async () => {
    prisma = {
      usuarios: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
      },
      perfis_usuario: { findUnique: jest.fn() },
    };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [UsuariosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = modulo.get(UsuariosService);
  });

  describe('listar', () => {
    it('deve filtrar por data_hora_exclusao null e respeitar paginação', async () => {
      prisma.usuarios.findMany.mockResolvedValue([usuarioFake()]);
      prisma.usuarios.count.mockResolvedValue(1);

      const r = await service.listar({ pagina: 1, tamanho_pagina: 20 });

      expect(r.total).toBe(1);
      expect(r.pagina).toBe(1);
      expect(r.tamanho_pagina).toBe(20);
      expect(prisma.usuarios.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ data_hora_exclusao: null }),
          skip: 0,
          take: 20,
        }),
      );
    });

    it('deve aplicar filtro de CNH vencendo em N dias', async () => {
      prisma.usuarios.findMany.mockResolvedValue([]);
      await service.listar({ cnhVencendoAteDias: 7 });
      const arg = prisma.usuarios.findMany.mock.calls[0][0];
      expect(arg.where.cnh_validade).toEqual(
        expect.objectContaining({ not: null, lte: expect.any(Date) }),
      );
    });
  });

  describe('buscarPorId', () => {
    it('deve lançar NotFound quando não existir', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(null);
      await expect(service.buscarPorId(999)).rejects.toThrow(NotFoundException);
    });

    it('deve retornar resposta mapeada com perfil expandido', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(usuarioFake());
      const r = await service.buscarPorId(1);
      expect(r.id).toBe(1);
      expect(r.perfil).toEqual({ id: 4, nome: 'operador', descricao: null });
      expect(r).not.toHaveProperty('senha_hash');
    });
  });

  describe('criar', () => {
    const dtoBase = {
      matricula: '0000000099',
      nome: 'Novo',
      senha: 'Senha@123',
      perfil_id: 4,
    };

    it('deve rejeitar perfil inválido', async () => {
      prisma.perfis_usuario.findUnique.mockResolvedValue(null);
      await expect(service.criar(dtoBase)).rejects.toThrow(BadRequestException);
    });

    it('deve exigir CNH + validade quando perfil é motorista', async () => {
      prisma.perfis_usuario.findUnique.mockResolvedValue(perfilFake('motorista', 5));
      await expect(service.criar({ ...dtoBase, perfil_id: 5 })).rejects.toThrow(/CNH/i);
    });

    it('deve aceitar motorista quando CNH + validade presentes', async () => {
      prisma.perfis_usuario.findUnique.mockResolvedValue(perfilFake('motorista', 5));
      prisma.usuarios.findFirst.mockResolvedValue(null); // matricula livre
      prisma.usuarios.create.mockResolvedValue(
        usuarioFake({ perfil_id: 5, perfil: perfilFake('motorista', 5), cnh: '12345678901', cnh_validade: new Date('2027-01-01') }),
      );

      const r = await service.criar({
        ...dtoBase,
        perfil_id: 5,
        cnh: '12345678901',
        cnh_validade: '2027-01-01',
      });

      expect(r.cnh).toBe('12345678901');
    });

    it('deve rejeitar matrícula duplicada', async () => {
      prisma.perfis_usuario.findUnique.mockResolvedValue(perfilFake('operador'));
      prisma.usuarios.findFirst.mockResolvedValue(usuarioFake());
      await expect(service.criar(dtoBase)).rejects.toThrow(ConflictException);
    });

    it('deve hashear senha antes de salvar (não passa senha plain pro Prisma)', async () => {
      prisma.perfis_usuario.findUnique.mockResolvedValue(perfilFake('operador'));
      prisma.usuarios.findFirst.mockResolvedValue(null);
      prisma.usuarios.create.mockResolvedValue(usuarioFake());

      await service.criar(dtoBase);

      const call = prisma.usuarios.create.mock.calls[0][0];
      expect(call.data.senha_hash).toMatch(/^\$2[ab]\$/); // formato bcrypt
      expect(call.data).not.toHaveProperty('senha');
    });
  });

  describe('inativar', () => {
    it('deve setar ativo=false sem apagar (soft state change)', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(usuarioFake({ ativo: true }));
      prisma.usuarios.update.mockResolvedValue(usuarioFake({ ativo: false }));

      await service.inativar(1);

      expect(prisma.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { ativo: false },
        }),
      );
    });

    it('deve lançar NotFound quando id não existir', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(null);
      await expect(service.inativar(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('excluir', () => {
    it('deve fazer soft delete (preenche data_hora_exclusao)', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(usuarioFake());
      prisma.usuarios.update.mockResolvedValue(usuarioFake({ data_hora_exclusao: new Date() }));

      await service.excluir(1);

      const call = prisma.usuarios.update.mock.calls[0][0];
      expect(call.data.data_hora_exclusao).toBeInstanceOf(Date);
    });
  });

  describe('registrarPushToken', () => {
    it('deve atualizar token quando válido', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(usuarioFake());
      prisma.usuarios.update.mockResolvedValue(usuarioFake());

      await service.registrarPushToken(1, 'ExponentPushToken[abc123]');

      expect(prisma.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { expo_push_token: 'ExponentPushToken[abc123]' },
        }),
      );
    });

    it('deve aceitar null para limpar o token', async () => {
      prisma.usuarios.findFirst.mockResolvedValue(usuarioFake());
      prisma.usuarios.update.mockResolvedValue(usuarioFake());

      await service.registrarPushToken(1, null);

      expect(prisma.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { expo_push_token: null } }),
      );
    });
  });
});
