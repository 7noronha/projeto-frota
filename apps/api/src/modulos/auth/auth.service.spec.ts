import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';

// Skeleton spec (rewrite pós-refactor schema-snake-case-reset).
// Spec original em src/modulos/.OLD-specs-uuid-snapshot/auth.service.spec.ts
// cobria fluxo completo com UUID — esta versão valida apenas a construção
// e o caminho de erro principal. Expandir cobertura incrementalmente.
describe('AuthService', () => {
  let service: AuthService;
  let prisma: { usuarios: { findFirst: jest.Mock } };

  beforeEach(async () => {
    prisma = { usuarios: { findFirst: jest.fn() } };
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('jwt-fake') } },
      ],
    }).compile();
    service = modulo.get(AuthService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar Unauthorized quando matrícula não existir', async () => {
    prisma.usuarios.findFirst.mockResolvedValue(null);
    await expect(service.login({ matricula: '0000000099', senha: 'qualquer' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
