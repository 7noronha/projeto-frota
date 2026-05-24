import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';

/**
 * E2E smoke do fluxo de viagem.
 *
 * Spec ampla original (310 linhas) arquivada em
 * `test/.OLD-uuid-snapshot/fluxo-viagem.e2e-spec.ts` — escrita para schema UUID.
 * Reescrita pendente: cobrir CRIAR → INICIAR → POSICAO → FINALIZAR end-to-end.
 *
 * Por ora valida o caminho crítico mínimo: app sobe, login retorna token.
 */

const MATRICULA_OPERADOR = '9900000001';
const SENHA_TESTE = 'SenhaTeste1!';

async function limparUsuarioTeste(prisma: PrismaService): Promise<void> {
  await prisma.usuarios.deleteMany({ where: { matricula: MATRICULA_OPERADOR } });
}

describe('Fluxo de viagem (E2E smoke)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const fixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = fixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = app.get(PrismaService);
    await limparUsuarioTeste(prisma);

    // Garante perfil "operador" existe (vem do seed principal)
    const perfilOperador = await prisma.perfis_usuario.findUnique({ where: { nome: 'operador' } });
    if (!perfilOperador) {
      throw new Error('Lookup perfis_usuario.operador ausente — rode `prisma db seed` antes.');
    }

    await prisma.usuarios.create({
      data: {
        matricula: MATRICULA_OPERADOR,
        nome: 'Operador Teste E2E',
        senha_hash: await bcrypt.hash(SENHA_TESTE, 10),
        perfil_id: perfilOperador.id,
        ativo: true,
      },
    });
  });

  afterAll(async () => {
    if (prisma) await limparUsuarioTeste(prisma);
    if (app) await app.close();
  });

  it('deve permitir login e devolver token JWT', async () => {
    const resp = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { matricula: MATRICULA_OPERADOR, senha: SENHA_TESTE },
    });

    expect(resp.statusCode).toBe(201);
    const body = JSON.parse(resp.body) as { token: string; usuario: { matricula: string } };
    expect(body.token).toMatch(/^eyJ/); // JWT começa com base64 "eyJ"
    expect(body.usuario.matricula).toBe(MATRICULA_OPERADOR);
  });

  it('deve rejeitar credenciais inválidas com 401', async () => {
    const resp = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { matricula: MATRICULA_OPERADOR, senha: 'senhaerrada' },
    });
    expect(resp.statusCode).toBe(401);
  });

  it('deve expor /lookups/perfis_usuario com array não-vazio', async () => {
    // Faz login primeiro pra pegar token
    const login = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { matricula: MATRICULA_OPERADOR, senha: SENHA_TESTE },
    });
    const { token } = JSON.parse(login.body) as { token: string };

    const resp = await app.inject({
      method: 'GET',
      url: '/lookups/perfis_usuario',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(resp.statusCode).toBe(200);
    const lookups = JSON.parse(resp.body) as Array<{ id: number; nome: string }>;
    expect(Array.isArray(lookups)).toBe(true);
    expect(lookups.length).toBeGreaterThan(0);
    expect(lookups.find((l) => l.nome === 'operador')).toBeDefined();
  });
});
