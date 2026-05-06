# PRD — Sistema de Gestão de Frota Corporativa (FleetOps)

> **Product Requirements Document — MVP v1.0**
> **Data:** Abril/2026
> **Status:** Aprovado para início de desenvolvimento
> **Escopo:** MVP enxuto (viagem: criar → iniciar → finalizar)

---

## 1. Visão Geral

### 1.1. Resumo Executivo

O **FleetOps** é um sistema corporativo de gestão de frota de veículos. O MVP v1.0 entrega o fluxo essencial de **operação de viagens**: o operador cadastra veículos e viagens via web, o motorista inicia e finaliza suas viagens pelo app mobile.

Plataforma composta por:

1. **Backend (API)** — NestJS + Fastify + Prisma + PostgreSQL
2. **Web (Painel do Operador)** — Next.js 15 + shadcn/ui + Tailwind
3. **Mobile (App do Motorista)** — React Native + Expo + Gluestack UI

### 1.2. Objetivos do MVP

- Validar o fluxo ponta-a-ponta de uma viagem (criação web → execução mobile → finalização).
- Estabelecer a base técnica (monorepo, autenticação, observabilidade, CI/CD, deploy).
- Entregar uma operação mínima viável em produção para coleta de feedback real.
- Arquitetura preparada para evolução (manutenções, multas, rastreamento em tempo real, dashboards).

### 1.3. Público-Alvo

| Persona | Plataforma | Papel no MVP |
|---|---|---|
| **Administrador** | Web | Gerencia usuários e configurações. |
| **Operador** | Web | Cadastra veículos, motoristas e cria viagens. Pode iniciar/finalizar viagens. |
| **Motorista** | Mobile | Visualiza suas viagens, inicia e finaliza. |

*Papéis **Gerente** e **Encarregado** ficam mapeados no sistema, mas sem funcionalidades específicas nesta versão.*

---

## 2. Escopo do MVP

### 2.1. Dentro do Escopo

- **Autenticação por matrícula + senha** (JWT único de 7 dias)
- **CRUD de Veículos** (criar, listar, editar, excluir logicamente)
- **CRUD de Usuários** (admin, operador, motorista — apenas admin gerencia)
- **Criação de Viagens** (web — apenas operador+)
- **Listagem de Viagens** (web e mobile)
- **Iniciar Viagem** (mobile pelo motorista, web pelo operador)
- **Finalizar Viagem** (mobile pelo motorista, web pelo operador)
- **Registro de Odômetro** inicial e final (obrigatório)
- **Observabilidade de requisições HTTP** (middleware de log estruturado)
- **Interface em PT-BR** (estrutura de i18n preparada)
- **Paleta visual em tons de azul corporativo**

### 2.2. Fora do Escopo (fases futuras)

- Gestão de manutenções, multas, impostos, seguros, combustível
- Dashboard e relatórios
- Rastreamento GPS em tempo real
- Check-list pré/pós viagem
- Lançamento de custos pelo motorista no app
- Modo offline (mobile)
- Alertas automáticos e notificações push
- Upload de fotos e documentos
- Integrações externas
- Multi-idioma ativo (EN/ES)
- 2FA, recuperação de senha, refresh tokens

---

## 3. Stack Tecnológica

### 3.1. Versões LTS Utilizadas (Abril 2026)

Todas as tecnologias devem usar a última versão LTS disponível no momento do início do projeto:

| Tecnologia | Versão mínima | Observações |
|---|---|---|
| **Node.js** | **24 LTS** (24.15.x) | Suporte até Abril/2028 |
| **PostgreSQL** | **17 LTS** | — |
| **TypeScript** | **5.7+** | strict mode obrigatório |
| **NestJS** | **11.x** | — |
| **Next.js** | **15.x** | App Router com async params |
| **React** | **19.x** | — |
| **React Native** | **0.77+** | (via Expo SDK 55) |
| **Expo SDK** | **55.x** | — |
| **Prisma** | **6.x** | — |
| **Tailwind CSS** | **4.x** | — |
| **shadcn/ui** | Última | — |
| **Gluestack UI** | **v2** | — |
| **Fastify** | **5.x** | via `@nestjs/platform-fastify` |
| **Turborepo** | Última stable | — |

### 3.2. Estrutura do Monorepo

**Turborepo** compartilhando tipos e schemas entre os 3 projetos:

```
fleetops/
├── apps/
│   ├── api/          → Backend NestJS + Fastify
│   ├── web/          → Next.js 15 (App Router)
│   └── mobile/       → React Native + Expo 55
├── packages/
│   ├── types/        → Tipos/DTOs compartilhados
│   ├── validation/   → Schemas Zod compartilhados
│   ├── config/       → ESLint, TSConfig, Prettier, Tailwind
│   └── utils/        → Utilitários comuns (ex.: datetime com TZ Brasília)
├── turbo.json
└── package.json
```

### 3.3. Backend (API)

| Camada | Tecnologia | Observações |
|---|---|---|
| Runtime | **Node.js 24 LTS** | Bun como package manager/script runner no dev |
| Framework | **NestJS 11 + Fastify 5** | ~3x mais performático que Express |
| Linguagem | TypeScript 5.7+ (strict) | — |
| ORM | **Prisma 6** | Migrations + Prisma Client |
| Banco | **PostgreSQL 17** | Timezone: `America/Sao_Paulo` |
| Autenticação | **JWT simples (7 dias)** | Login por matrícula + senha |
| Senha | bcrypt (salt rounds: 10) | — |
| Validação | class-validator + Zod | — |
| Documentação | Swagger/OpenAPI (`@nestjs/swagger`) | — |
| Testes | Jest + Supertest | — |
| Logging | Pino + middleware de observabilidade | — |

### 3.4. Frontend Web

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5.7+ (strict) |
| UI | **shadcn/ui + Tailwind CSS 4** |
| Paleta | Tons de azul corporativo (seção 8.2) |
| Estado servidor | TanStack Query v5 |
| Estado cliente | Zustand |
| Formulários | React Hook Form + Zod |
| Tabelas | TanStack Table |
| i18n | next-intl (PT-BR ativo) |
| Testes | Vitest + React Testing Library + Playwright |

### 3.5. Mobile

| Camada | Tecnologia |
|---|---|
| Framework | React Native 0.77 + Expo SDK 55 |
| Linguagem | TypeScript 5.7+ |
| UI | **Gluestack UI v2** |
| Navegação | Expo Router |
| Estado servidor | TanStack Query v5 |
| Estado cliente | Zustand |
| Storage seguro | expo-secure-store (JWT) |
| i18n | i18next |
| Testes | Jest + React Native Testing Library |

### 3.6. Infraestrutura (AWS)

| Serviço | Função |
|---|---|
| ECS Fargate | Containers da API |
| RDS PostgreSQL 17 | Banco de dados (timezone: `America/Sao_Paulo`) |
| S3 | Armazenamento futuro de arquivos |
| CloudFront | CDN |
| Route 53 + ACM | DNS + SSL |
| Secrets Manager | Credenciais |
| CloudWatch Logs | Logs estruturados |
| Vercel | Deploy do Next.js (opcional) |
| EAS (Expo) | Build do app mobile |

### 3.7. DevOps

- **Containers:** Docker + Docker Compose (dev local)
- **Package Manager:** Bun (dev) / npm (CI/produção)
- **CI/CD:** GitHub Actions
- **Code Quality:** ESLint + Prettier + Husky + lint-staged + Commitlint

### 3.8. Decisões Técnicas Relevantes

#### 3.8.1. Por que Node.js + Fastify (e não Bun em produção)
Bun oferece ~3x mais throughput sintético, mas o ganho real com PostgreSQL + Prisma cai para 3–10% (banco é o gargalo). Debugging e observabilidade em Bun ainda não são tão maduros. **Estratégia:** Node.js 24 LTS em produção + Bun como ferramenta de desenvolvimento.

#### 3.8.2. Por que Fastify no NestJS
Benchmarks 2026: **NestJS + Fastify ≈ 50k req/s** vs. **NestJS + Express ≈ 17k req/s** — ~3x de ganho real com CPU ~82% menor (economia direta em cloud).

#### 3.8.3. Fuso horário fixo Brasília (sem UTC)
Todos os timestamps persistidos no fuso `America/Sao_Paulo` usando `TIMESTAMP WITHOUT TIME ZONE`. Riscos documentados com mitigações via utilitário central `packages/utils/datetime.ts`.

---

## 4. Autenticação

### 4.1. Login por Matrícula

**O sistema usa matrícula da empresa como identificador de login**, não e-mail.

- Formato da matrícula: **10 dígitos numéricos** (ex.: `0009003656`)
- Cada usuário tem uma matrícula única atribuída pela empresa
- O operador/admin cadastra a matrícula no momento da criação do usuário
- O campo `email` permanece no cadastro apenas como dado complementar opcional

### 4.2. Fluxo de Autenticação

1. Usuário envia `matricula + senha` para `POST /auth/login`
2. API busca usuário pela matrícula, valida a senha (bcrypt) e checa se está `ativo`
3. API retorna **um único JWT** com validade de **7 dias**
4. Cliente armazena o token:
   - **Web:** cookie HttpOnly + Secure + SameSite=Lax
   - **Mobile:** `expo-secure-store`
5. Cliente envia o token no header `Authorization: Bearer <token>` em toda requisição autenticada
6. Logout = remover token do client (sem blacklist)

### 4.3. Payload do JWT

```json
{
  "sub": "uuid-do-usuario",
  "matricula": "0009003656",
  "nome": "João Silva",
  "perfil": "operador",
  "iat": 1713900000,
  "exp": 1714504800
}
```

### 4.4. Papéis (Roles)

| Código | Nome | Acesso |
|---|---|---|
| `admin` | Administrador | Total |
| `gerente` | Gerente | Reservado (não usado no MVP) |
| `encarregado` | Encarregado | Reservado (não usado no MVP) |
| `operador` | Operador | CRUD de veículos, motoristas e viagens |
| `motorista` | Motorista | Apenas mobile: suas próprias viagens |

### 4.5. Matriz de Permissões do MVP

| Funcionalidade | Admin | Operador | Motorista |
|---|:---:|:---:|:---:|
| Gerenciar usuários | ✅ | ❌ | ❌ |
| CRUD de veículos | ✅ | ✅ | ❌ |
| Criar viagens | ✅ | ✅ | ❌ |
| Iniciar/finalizar viagens | ✅ | ✅ | ✅ (só as próprias) |
| Listar viagens | ✅ | ✅ | ✅ (só as próprias) |

---

## 5. Observabilidade (Middleware de Log de Requisições)

### 5.1. Objetivo

Toda requisição HTTP que chega à API deve ser registrada com um log estruturado, contendo metadados técnicos e de negócio, para fins de auditoria, depuração e monitoramento.

### 5.2. Campos Registrados

Cada requisição deve gerar um log com os seguintes campos:

| Campo | Descrição |
|---|---|
| `dataHora` | Timestamp no fuso America/Sao_Paulo (ISO-like) |
| `duracaoMs` | Tempo total de processamento em milissegundos |
| `ip` | IP da requisição |
| `method` | Método HTTP (GET, POST, etc.) |
| `path` | Path da rota |
| `url` | URL completa |
| `status` | Código de status HTTP de resposta |
| `body` | Body da requisição (com sanitização de campos sensíveis como `senha`) |
| `query` | Query string |
| `params` | Path params |
| `userId` | ID do usuário autenticado (se houver) |
| `matricula` | Matrícula do usuário autenticado (se houver) |
| `message` | Mensagem de erro (se status ≥ 400) |

### 5.3. Implementação (NestJS + Fastify)

> ⚠️ **Importante:** como o projeto usa **Fastify** (não Express), o middleware precisa ser implementado usando os tipos do Fastify. A referência abaixo mostra o código equivalente adaptado.

```typescript
// apps/api/src/common/middlewares/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { agoraBrasilia } from '@fleetops/utils/datetime';

const CAMPOS_SENSIVEIS = ['senha', 'password', 'token', 'authorization'];

function sanitizarBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const copia: Record<string, unknown> = { ...(body as Record<string, unknown>) };
  for (const campo of CAMPOS_SENSIVEIS) {
    if (campo in copia) copia[campo] = '***';
  }
  return copia;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    const inicioMs = Date.now();
    const reqFastify = req as unknown as FastifyRequest;

    res.on('finish', () => {
      const dataHora = agoraBrasilia();
      const usuario = (reqFastify as any).user ?? null;

      // eslint-disable-next-line no-console
      console.log({
        dataHora,
        duracaoMs: Date.now() - inicioMs,
        ip: req.socket.remoteAddress,
        method: req.method,
        path: (reqFastify as any).routerPath ?? req.url,
        url: req.url,
        status: res.statusCode,
        body: sanitizarBody((reqFastify as any).body),
        query: (reqFastify as any).query,
        params: (reqFastify as any).params,
        userId: usuario?.sub ?? null,
        matricula: usuario?.matricula ?? null,
        message: (res as any).locals?.errorMessage ?? null,
      });
    });

    next();
  }
}
```

### 5.4. Registro Global

O middleware é registrado em `AppModule` para aplicar a todas as rotas:

```typescript
// apps/api/src/app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

### 5.5. Evolução Futura

Na v2, o `console.log` será substituído por **Pino** com output estruturado para CloudWatch Logs, permitindo:
- Filtragem por campos (ex.: `status: 500`)
- Alertas automáticos (ex.: > 10 erros 500 em 5 minutos)
- Métricas (p95 latência por endpoint)

---

## 6. Requisitos Funcionais — MVP

### 6.1. Módulo: Autenticação

**RF-001** — Login: `POST /auth/login` com `matricula + senha` retorna JWT.
**RF-002** — Rota protegida: `GET /auth/perfil` retorna dados do usuário autenticado.
**RF-003** — Logout: apenas client-side (remover token).

### 6.2. Módulo: Usuários (Web — Admin)

**RF-010** — Listar usuários (paginação, filtro por perfil, filtro por matrícula).
**RF-011** — Cadastrar usuário:

| Campo | Obrigatório | Observações |
|---|:---:|---|
| `matricula` | ✅ | 10 dígitos, única |
| `nome` | ✅ | Nome completo |
| `senha` | ✅ | Mínimo 8 caracteres |
| `perfil` | ✅ | `admin`/`gerente`/`encarregado`/`operador`/`motorista` |
| `email` | ❌ | Opcional, dado complementar |
| `telefone` | ❌ | Opcional |
| `cnh` | ⚠️ | Obrigatório se perfil = motorista |
| `cnh_validade` | ⚠️ | Obrigatório se perfil = motorista |
| `ativo` | ✅ | Default `true` |

**RF-012** — Editar dados do usuário.
**RF-013** — Inativar usuário (exclusão lógica — `data_exclusao`).

---

### 6.3. Módulo: Veículos (Web — Operador+)

**RF-020** — Listar veículos com filtros (placa, modelo, situação).
**RF-021** — Cadastrar veículo:

| Campo | Obrigatório | Observações |
|---|:---:|---|
| `placa` | ✅ | Validada (formato antigo ou Mercosul), única |
| `marca` | ✅ | Ex: Toyota |
| `modelo` | ✅ | Ex: Corolla |
| `ano_fabricacao` | ✅ | — |
| `ano_modelo` | ✅ | — |
| `cor` | ✅ | — |
| `renavam` | ✅ | Único |
| `odometro_atual` | ✅ | Em km |
| `data_aquisicao` | ✅ | — |
| `situacao` | ✅ | `ativo`/`em_manutencao`/`inativo`/`baixado` |
| `observacoes` | ❌ | Campo livre |

**RF-022** — Editar veículo.
**RF-023** — Exclusão lógica (soft delete) — registra `data_exclusao`.

> 📝 **Nota:** Por decisão de produto, os campos `chassi`, `tipo`, `combustivel`, `capacidade_tanque` e `capacidade_passageiros` **não fazem parte do MVP**. Podem ser adicionados em versões futuras via migration sem impacto funcional.

---

### 6.4. Módulo: Viagens

#### 6.4.1. Ciclo de Vida

```
   CRIADA  →  EM_ANDAMENTO  →  FINALIZADA
```

Estados simples, lineares e sem retorno.

#### 6.4.2. Criação da Viagem (Web — Operador+)

**RF-030** — `POST /viagens` com os seguintes campos:

| Campo | Obrigatório | Observações |
|---|:---:|---|
| `destino` | ✅ | Endereço em texto livre |
| `data_viagem` | ✅ | Data da viagem |
| `hora_inicio_prevista` | ✅ | Hora planejada de início |
| `hora_fim_prevista` | ✅ | Hora planejada de fim |
| `motorista_id` | ✅ | FK para `usuarios` (perfil = motorista) |
| `veiculo_id` | ✅ | FK para `veiculos` (situação = ativo) |
| `solicitado_por` | ✅ | Texto: nome de quem solicitou |
| `autorizado_por` | ✅ | Texto: nome de quem autorizou |
| `observacoes` | ❌ | Campo livre |

**Campos preenchidos automaticamente:**
- `origem` — sempre igual ao endereço da sede (configuração do sistema)
- `operador_criador_id` — usuário autenticado que criou
- `status` — inicia como `CRIADA`
- `data_criacao` — timestamp no fuso Brasília

**Validações de negócio:**
- Motorista não pode ter outra viagem `EM_ANDAMENTO` ou `CRIADA` em conflito no mesmo período
- Veículo não pode ter outra viagem `EM_ANDAMENTO` ou `CRIADA` em conflito no mesmo período
- `hora_fim_prevista` deve ser posterior a `hora_inicio_prevista`
- Motorista deve ter CNH válida (data de validade > hoje)

#### 6.4.3. Iniciar Viagem

**RF-031** — `PATCH /viagens/:id/iniciar`

**Permitido para:** Operador (Web) ou Motorista atribuído (Mobile).
**Pré-condição:** status = `CRIADA`.
**Body obrigatório:** `odometro_inicial` (numérico, ≥ odômetro atual do veículo).

**Efeitos:**
- `status` → `EM_ANDAMENTO`
- `data_hora_inicio_real` = timestamp atual (fuso Brasília)
- `odometro_inicial` registrado

#### 6.4.4. Finalizar Viagem

**RF-032** — `PATCH /viagens/:id/finalizar`

**Permitido para:** Operador (Web) ou Motorista atribuído (Mobile).
**Pré-condição:** status = `EM_ANDAMENTO`.
**Body obrigatório:** `odometro_final` (numérico, > `odometro_inicial`).

**Efeitos:**
- `status` → `FINALIZADA`
- `data_hora_fim_real` = timestamp atual (fuso Brasília)
- `odometro_final` registrado
- `distancia_percorrida` = `odometro_final - odometro_inicial` (calculado)
- Atualiza `odometro_atual` do veículo para o `odometro_final`

#### 6.4.5. Listagem de Viagens

**RF-033** — `GET /viagens`

**Web (admin/operador):** lista todas as viagens com filtros:
- Status
- Motorista
- Veículo
- Período (data_viagem entre X e Y)

**Mobile (motorista):** lista **apenas as viagens do próprio motorista autenticado**, ordenadas por data desc, com filtro por status.

**RF-034** — `GET /viagens/:id` — detalhes completos da viagem.

---

## 7. Modelagem de Dados (PT-BR + snake_case)

### 7.1. Convenções

- **Entidades (classes TS):** PascalCase em PT-BR (`Usuario`, `Veiculo`, `Viagem`)
- **Tabelas no PostgreSQL:** snake_case plural em PT-BR (`usuarios`, `veiculos`, `viagens`)
- **Colunas:** snake_case em PT-BR (`data_criacao`, `odometro_inicial`, `motorista_id`)
- **Enums/Status:** MAIUSCULAS_COM_UNDERSCORE (`CRIADA`, `EM_ANDAMENTO`, `FINALIZADA`)
- **Chaves primárias:** `id` do tipo UUID v4
- **Exclusão lógica:** coluna `data_exclusao TIMESTAMP NULL`
- **Timestamps:** `data_criacao`, `data_atualizacao` (`TIMESTAMP WITHOUT TIME ZONE` em fuso Brasília)

### 7.2. Tabela: `usuarios`

| Coluna | Tipo | Observações |
|---|---|---|
| `id` | UUID PK | — |
| `matricula` | VARCHAR(10) UNIQUE | 10 dígitos, único, usado para login |
| `nome` | VARCHAR(200) | Obrigatório |
| `senha_hash` | VARCHAR(255) | bcrypt |
| `perfil` | VARCHAR(20) | `admin` / `gerente` / `encarregado` / `operador` / `motorista` |
| `email` | VARCHAR(200) | Opcional, complementar |
| `telefone` | VARCHAR(20) | Opcional |
| `cnh` | VARCHAR(20) | Obrigatório se perfil=motorista |
| `cnh_validade` | DATE | Obrigatório se perfil=motorista |
| `ativo` | BOOLEAN | Default `true` |
| `data_criacao` | TIMESTAMP | — |
| `data_atualizacao` | TIMESTAMP | — |
| `data_exclusao` | TIMESTAMP NULL | Soft delete |

### 7.3. Tabela: `veiculos`

| Coluna | Tipo | Observações |
|---|---|---|
| `id` | UUID PK | — |
| `placa` | VARCHAR(10) UNIQUE | — |
| `marca` | VARCHAR(80) | — |
| `modelo` | VARCHAR(100) | — |
| `ano_fabricacao` | INT | — |
| `ano_modelo` | INT | — |
| `cor` | VARCHAR(50) | — |
| `renavam` | VARCHAR(11) UNIQUE | — |
| `odometro_atual` | INT | Em km |
| `data_aquisicao` | DATE | — |
| `situacao` | VARCHAR(20) | `ativo`/`em_manutencao`/`inativo`/`baixado` |
| `observacoes` | TEXT | Opcional |
| `data_criacao` | TIMESTAMP | — |
| `data_atualizacao` | TIMESTAMP | — |
| `data_exclusao` | TIMESTAMP NULL | — |

### 7.4. Tabela: `viagens`

| Coluna | Tipo | Observações |
|---|---|---|
| `id` | UUID PK | — |
| `origem` | VARCHAR(500) | Snapshot da sede |
| `destino` | VARCHAR(500) | — |
| `data_viagem` | DATE | — |
| `hora_inicio_prevista` | TIME | — |
| `hora_fim_prevista` | TIME | — |
| `data_hora_inicio_real` | TIMESTAMP NULL | Preenchida ao iniciar |
| `data_hora_fim_real` | TIMESTAMP NULL | Preenchida ao finalizar |
| `odometro_inicial` | INT NULL | — |
| `odometro_final` | INT NULL | — |
| `distancia_percorrida` | INT NULL | Calculada |
| `motorista_id` | UUID FK → usuarios | — |
| `veiculo_id` | UUID FK → veiculos | — |
| `operador_criador_id` | UUID FK → usuarios | — |
| `solicitado_por` | VARCHAR(200) | — |
| `autorizado_por` | VARCHAR(200) | — |
| `observacoes` | TEXT | Opcional |
| `status` | VARCHAR(20) | `CRIADA`/`EM_ANDAMENTO`/`FINALIZADA` |
| `data_criacao` | TIMESTAMP | — |
| `data_atualizacao` | TIMESTAMP | — |
| `data_exclusao` | TIMESTAMP NULL | — |

### 7.5. Tabela: `configuracoes`

Para armazenar configurações globais como o endereço da sede.

| Coluna | Tipo | Observações |
|---|---|---|
| `id` | UUID PK | — |
| `chave` | VARCHAR(100) UNIQUE | Ex: `endereco_sede` |
| `valor` | TEXT | Valor em texto ou JSON |
| `data_atualizacao` | TIMESTAMP | — |

### 7.6. Índices Recomendados

```sql
CREATE INDEX idx_viagens_motorista_status ON viagens (motorista_id, status);
CREATE INDEX idx_viagens_veiculo_status ON viagens (veiculo_id, status);
CREATE INDEX idx_viagens_data ON viagens (data_viagem);
CREATE INDEX idx_veiculos_placa ON veiculos (placa);
CREATE UNIQUE INDEX idx_usuarios_matricula ON usuarios (matricula);
CREATE INDEX idx_usuarios_perfil ON usuarios (perfil) WHERE ativo = true;
```

### 7.7. Exemplo de Schema Prisma (trecho)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Usuario {
  id              String    @id @default(uuid())
  matricula       String    @unique @db.VarChar(10)
  nome            String    @db.VarChar(200)
  senhaHash       String    @map("senha_hash") @db.VarChar(255)
  perfil          String    @db.VarChar(20)
  email           String?   @db.VarChar(200)
  telefone        String?   @db.VarChar(20)
  cnh             String?   @db.VarChar(20)
  cnhValidade     DateTime? @map("cnh_validade") @db.Date
  ativo           Boolean   @default(true)

  dataCriacao     DateTime  @default(now()) @map("data_criacao") @db.Timestamp(6)
  dataAtualizacao DateTime  @updatedAt @map("data_atualizacao") @db.Timestamp(6)
  dataExclusao    DateTime? @map("data_exclusao") @db.Timestamp(6)

  viagensComoMotorista Viagem[] @relation("MotoristaViagens")
  viagensCriadas       Viagem[] @relation("OperadorCriadorViagens")

  @@map("usuarios")
}

model Veiculo {
  id              String    @id @default(uuid())
  placa           String    @unique @db.VarChar(10)
  marca           String    @db.VarChar(80)
  modelo          String    @db.VarChar(100)
  anoFabricacao   Int       @map("ano_fabricacao")
  anoModelo       Int       @map("ano_modelo")
  cor             String    @db.VarChar(50)
  renavam         String    @unique @db.VarChar(11)
  odometroAtual   Int       @map("odometro_atual")
  dataAquisicao   DateTime  @map("data_aquisicao") @db.Date
  situacao        String    @db.VarChar(20)
  observacoes     String?   @db.Text

  dataCriacao     DateTime  @default(now()) @map("data_criacao") @db.Timestamp(6)
  dataAtualizacao DateTime  @updatedAt @map("data_atualizacao") @db.Timestamp(6)
  dataExclusao    DateTime? @map("data_exclusao") @db.Timestamp(6)

  viagens         Viagem[]

  @@map("veiculos")
}
```

---

## 8. Requisitos Não-Funcionais (MVP)

### 8.1. Performance
- API p95 < 300ms (com Fastify)
- Web LCP < 2.5s
- Mobile abertura < 3s

### 8.2. Disponibilidade
- SLA alvo: 99% (MVP)
- Backup diário automatizado do RDS

### 8.3. Segurança (básica, adequada ao escopo)
- HTTPS obrigatório
- Senhas com bcrypt
- Rate limiting nas rotas de `/auth`
- Validação de entrada em todos os endpoints (class-validator + Zod)
- CORS configurado (apenas origens permitidas)
- Helmet básico
- **Campos sensíveis no body (`senha`, `token`) são mascarados nos logs**

> **Nota:** Como **não há dados sensíveis** armazenados (sem cartão, sem CPF, sem dados bancários), o nível de segurança do MVP é focado em fundamentos — sem 2FA, sem criptografia em repouso além do padrão do RDS, sem auditoria detalhada.

### 8.4. Observabilidade
- **Middleware global de log de requisições** (seção 5)
- Logs estruturados em JSON
- CloudWatch Logs
- Sentry opcional (web e mobile)

### 8.5. Fuso Horário
- Toda a aplicação usa `America/Sao_Paulo` como fuso único
- Timestamps persistidos como `TIMESTAMP WITHOUT TIME ZONE`
- Utilitário central (`packages/utils/datetime.ts`) para todas as operações de data

### 8.6. Testes
- Cobertura mínima de **70%** do código crítico (services)
- Testes unitários (Jest/Vitest)
- Testes E2E dos fluxos principais (Playwright web + Detox mobile, quando viável)
- CI bloqueando merge se testes falharem

---

## 9. Design e UX

### 9.1. Princípios

- Simplicidade — o MVP deve ser intuitivo sem treinamento
- Clareza — o motorista abre o app, vê suas viagens e age com 2 toques
- Consistência — web e mobile compartilham tokens de design
- Acessibilidade — WCAG AA na web

### 9.2. Paleta de Cores (Azul Corporativo)

```
PRIMÁRIA
├── Azul principal     #0066FF   (ações principais, CTAs)
├── Azul escuro        #0047B3   (hover, estados ativos)
├── Azul marinho       #0A2540   (headers, navegação)

SECUNDÁRIA / ACENTO
├── Ciano              #00C2FF   (destaques, links)
├── Azul claro         #E6F0FF   (backgrounds sutis, cards)

NEUTROS (Slate - base azulada)
├── slate-50           #F8FAFC   (background da página)
├── slate-100          #F1F5F9   (background de seções)
├── slate-200          #E2E8F0   (borders)
├── slate-500          #64748B   (texto secundário)
├── slate-700          #334155   (texto principal)
├── slate-900          #0F172A   (texto forte)

SEMÂNTICAS
├── Sucesso            #10B981   (verde)
├── Alerta             #F59E0B   (amarelo)
├── Erro               #EF4444   (vermelho)
├── Info               #3B82F6   (azul info)

MODO ESCURO
├── Background         #0A2540
├── Surface            #0F2D4F
├── Primary            #3B8BFF   (azul mais claro para contraste)
```

### 9.3. Tipografia
- **Web:** Inter (Google Fonts)
- **Mobile:** System fonts (San Francisco iOS / Roboto Android)

### 9.4. Telas Mínimas do MVP

**Web:**
1. Login (matrícula + senha)
2. Dashboard (lista de viagens recentes)
3. Veículos — listagem + form criar/editar
4. Motoristas/Usuários — listagem + form (admin only)
5. Viagens — listagem + form criar + detalhes + ações (iniciar/finalizar)
6. Perfil/Sair

**Mobile:**
1. Login (matrícula + senha)
2. Lista de Minhas Viagens (tabs: Próximas / Em Andamento / Histórico)
3. Detalhes da Viagem
4. Iniciar Viagem (input do odômetro)
5. Finalizar Viagem (input do odômetro)
6. Perfil/Sair

---

## 10. Roadmap de Desenvolvimento do MVP

| Fase | Duração | Entregáveis |
|---|---|---|
| **0 — Fundação** | 1 semana | Monorepo, Docker, CI, Prisma setup, boilerplate das 3 apps, middleware de observabilidade |
| **1 — Auth + Usuários** | 1 semana | Login JWT por matrícula, CRUD de usuários, middleware de autorização |
| **2 — Veículos** | 1 semana | CRUD completo de veículos na web |
| **3 — Viagens Web** | 1,5 semanas | Criação de viagens, listagem, detalhes, iniciar/finalizar via web |
| **4 — App Mobile** | 2 semanas | Auth mobile, lista de viagens, iniciar/finalizar |
| **5 — Polimento + QA** | 1 semana | Testes E2E, ajustes de UX, documentação |
| **6 — Deploy** | 0,5 semana | Deploy em AWS + publicação do app (EAS) |

**Total estimado:** ~8 semanas

---

## 11. Definition of Done (por feature)

- [ ] Código segue padrões (ESLint/Prettier sem warnings)
- [ ] Testes unitários escritos e passando
- [ ] Testes de integração dos fluxos principais
- [ ] Revisão de código aprovada por 1 par
- [ ] Validado em ambiente de staging
- [ ] Sem vulnerabilidades críticas (npm audit)
- [ ] Endpoint documentado no Swagger
- [ ] Requisições registradas no log estruturado
- [ ] Tela validada em design review (se aplicável)

---

## 12. Riscos e Mitigações

| Risco | Probab. | Impacto | Mitigação |
|---|:---:|:---:|---|
| Timezone Brasília causar bugs | Média | Médio | Utilitário central + testes específicos de DateTime |
| Matrícula duplicada por erro humano | Média | Alto | Constraint UNIQUE + validação em 2 camadas (client e server) |
| JWT de 7 dias expirar durante operação | Baixa | Baixo | 7 dias é suficiente para o perfil de uso |
| Fastify breaking change no NestJS | Baixa | Médio | Seguir versões estáveis (NestJS 11 + Fastify 5) |
| Motorista esquecer de finalizar viagem | Alta | Médio | Fase 2: alerta automático. MVP: relatório manual |
| Gluestack UI v2 ter bug crítico | Baixa | Alto | Componentes simples no MVP; fallback para primitivos RN |
| Log síncrono impactar performance | Baixa | Médio | Fase 2 migrar para Pino (não-bloqueante) |

---

## 13. Glossário

- **MVP** — Minimum Viable Product
- **JWT** — JSON Web Token
- **RBAC** — Role-Based Access Control
- **CNH** — Carteira Nacional de Habilitação
- **SLA** — Service Level Agreement
- **ORM** — Object-Relational Mapping
- **DTO** — Data Transfer Object
- **RDS** — Relational Database Service (AWS)
- **LTS** — Long-Term Support

---

## 14. Referências Técnicas

- [Node.js 24 LTS](https://nodejs.org/)
- [NestJS + Fastify Adapter](https://docs.nestjs.com/techniques/performance)
- [Prisma 6 with PostgreSQL](https://www.prisma.io/docs/orm/overview/databases/postgresql)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/)
- [Gluestack UI v2](https://gluestack.io/)
- [Expo SDK 55](https://docs.expo.dev/)
- [Turborepo](https://turbo.build/repo/docs)
- [date-fns-tz](https://github.com/marnusw/date-fns-tz)
- [PostgreSQL 17](https://www.postgresql.org/docs/17/)

---

**Status:** Aprovado para início do desenvolvimento via Claude Code.
**Próxima ação:** iniciar **Fase 0 (Fundação)** — configurar monorepo, stack base e middleware de observabilidade.
