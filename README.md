# FleetOps

> Sistema corporativo de gestão de frota de veículos — controle de viagens, motoristas, despesas e rastreamento em tempo real.

[![Node](https://img.shields.io/badge/node-24%20LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## Sobre o projeto

FleetOps gerencia o ciclo de vida de viagens corporativas:

- **Operador (web)** cadastra motoristas, veículos e cria viagens; acompanha em tempo real
- **Motorista (mobile)** vê viagens atribuídas, inicia/finaliza, reporta GPS e registra abastecimento
- **Gestão** consulta despesas por veículo (multas, abastecimentos, manutenções, impostos, seguros, documentações), relatórios de distância e alertas de CNH/seguro/manutenção vencidos

Stack desenhada para fluxos críticos — tudo é **strict TypeScript**, com schema PostgreSQL normalizado, JWT, geocodificação Mapbox e push notifications via Expo.

---

## Arquitetura

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  apps/web        │  HTTPS  │  apps/api        │  TCP/SSL│  PostgreSQL 17   │
│  Next.js 15      │ ◄─────► │  NestJS 11       │ ◄─────► │  Supabase (prod) │
│  Operador        │   JWT   │  Fastify 5       │  Prisma │  Docker (dev)    │
└──────────────────┘         │  Throttler       │         └──────────────────┘
                             │  Swagger /api    │
                             └────────▲─────────┘
                                      │ HTTPS + JWT
                             ┌────────┴─────────┐         ┌──────────────────┐
                             │  fleetops-mobile │  HTTPS  │  Mapbox          │
                             │  Expo 54         │ ◄─────► │  Geocoding +     │
                             │  Gluestack UI v2 │         │  Directions      │
                             │  Motorista       │         └──────────────────┘
                             └────────┬─────────┘
                                      │ Expo Push
                                      ▼
                             ┌──────────────────┐
                             │  Expo Push       │
                             │  (notificações)  │
                             └──────────────────┘
```

### Apps

| App | Stack | Responsabilidade | Hosting |
|---|---|---|---|
| `apps/api` | NestJS 11 + Fastify 5 + Prisma 6 | API REST, auth JWT, geocoding, cálculo de rotas | Railway |
| `apps/web` | Next.js 15 (App Router) + Tailwind 4 | UI do operador/gestor | Vercel |
| `fleetops-mobile` | Expo 54 + Expo Router + Gluestack UI v2 | App do motorista (standalone, fora do monorepo bun) | EAS Build |

### Packages compartilhados

- `packages/types` — DTOs e interfaces compartilhadas (`UsuarioResposta`, `ViagemDetalhada`, `ItemLookup`, ...)
- `packages/validation` — schemas Zod compartilhados client/server
- `packages/utils` — utilitários de data/hora em America/Sao_Paulo
- `packages/config` — eslint, tsconfig, tailwind base

---

## Stack — versões mínimas

| Tecnologia | Versão | Notas |
|---|---|---|
| Node.js | 24 LTS | `nvm use 24` ou `fnm use 24` |
| Bun | latest | runner do monorepo (`bunfig.toml` com linker hoisted) |
| Docker + Compose | latest | PostgreSQL local |
| PostgreSQL | 17 | TZ fixo em `America/Sao_Paulo` |
| TypeScript | 5.7+ | strict mode em todos os apps |
| NestJS | 11.x | Fastify 5 adapter |
| Next.js | 15.x | App Router + Server Actions |
| Expo SDK | 54.x | React Native 0.81 |
| Prisma | 6.x | snake_case + INT IDs |
| React | 19.1.x | |
| Tailwind | 4.x | CSS variables semânticas |

---

## Começando

### Pré-requisitos

- Node 24 LTS, Bun, Docker
- Conta Mapbox com token (gratuita até 50k requests/mês)

### Setup

```bash
# 1. Clone
git clone https://github.com/7noronha/projeto-frota.git frota
cd frota

# 2. Suba o Postgres local
docker compose up -d

# 3. Instale dependências do monorepo
bun install

# 4. Configure variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edite cada arquivo e preencha MAPBOX_TOKEN

# 5. Rode migrations + seed inicial
cd apps/api
bunx prisma migrate dev
bunx tsx prisma/seed.ts

# 6. (Opcional) Crie motorista de teste + viagens
bunx tsx prisma/seed-motorista-teste.ts

# 7. Volte à raiz e suba tudo em paralelo
cd ../..
bun run dev
```

### Mobile (projeto standalone)

O app mobile vive **fora** do monorepo, em `C:\fleetops-mobile` (ou diretório equivalente fora de qualquer `node_modules` ancestral — ver [CLAUDE.md](./CLAUDE.md#mobile) para a causa raiz documentada).

```bash
cd C:/fleetops-mobile
npm install
# Configure .env com EXPO_PUBLIC_API_URL apontando para o IP LAN do PC (ex: http://192.168.1.10:3001)
npx expo start
```

### Credenciais de teste

Após rodar `seed.ts` + `seed-motorista-teste.ts`:

| Perfil | Matrícula | Senha | Onde |
|---|---|---|---|
| Admin (operador) | `0000000001` | `Admin@123456` | Web |
| Motorista | `0000001234` | `12341234` | Mobile |

---

## Estrutura

```
frota/
├── apps/
│   ├── api/                     # Backend NestJS
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # 22 tabelas, snake_case, INT IDs
│   │   │   ├── migrations/
│   │   │   └── seed*.ts
│   │   └── src/
│   │       ├── common/          # PrismaService, JwtAuthGuard, RolesGuard, ...
│   │       └── modulos/         # 12 módulos de domínio
│   │           ├── auth/
│   │           ├── usuarios/
│   │           ├── veiculos/
│   │           ├── viagens/        # com /viagens/:id/posicoes (GPS)
│   │           ├── multas/         # despesas split em 6 tabelas
│   │           ├── abastecimentos/
│   │           ├── manutencoes/
│   │           ├── impostos/       # + audit em impostos_historicos
│   │           ├── seguros/
│   │           ├── documentacoes/
│   │           ├── alertas/
│   │           ├── relatorios/     # + velocidade.service
│   │           ├── configuracoes/
│   │           └── lookups/        # GET /lookups/:nome
│   └── web/                     # Frontend Next.js
│       ├── app/(dashboard)/
│       │   ├── dashboard/
│       │   ├── motoristas/
│       │   ├── usuarios/
│       │   ├── veiculos/
│       │   │   └── [id]/
│       │   │       ├── despesas/             # tela com 6 tabs
│       │   │       ├── multas/{nova,[multaId]/editar}
│       │   │       ├── abastecimentos/
│       │   │       ├── manutencoes/
│       │   │       ├── impostos/
│       │   │       ├── seguros/
│       │   │       └── documentacoes/
│       │   ├── viagens/
│       │   ├── relatorios/
│       │   ├── alertas/
│       │   └── configuracoes/
│       ├── components/          # shadcn/ui + componentes de domínio
│       └── lib/
├── packages/
│   ├── types/
│   ├── validation/
│   ├── utils/
│   └── config/
├── docs/
│   └── ERD.md                   # Diagrama entidade-relacionamento
├── CLAUDE.md                    # Convenções e regras do projeto
├── PRD-FleetOps-MVP.md          # Requisitos do produto
├── REFACTOR.md                  # Histórico do refactor schema-snake-case
├── DEPLOY_CHECKLIST.md          # Procedimento de deploy de produção
└── docker-compose.yml
```

---

## Banco de dados

22 tabelas em `snake_case` plural, IDs `Int autoincrement`, timestamps em `America/Sao_Paulo`:

- **9 tabelas de lookup** (`perfis_usuario`, `situacoes_veiculo`, `status_viagem`, `tipos_combustivel`, `tipos_manutencao`, `gravidades_multa`, `tipos_imposto`, `tipos_cobertura_seguro`, `tipos_documento_veiculo`)
- **2 entidades principais** (`usuarios`, `veiculos`)
- **2 entidades de viagem** (`viagens`, `posicoes_viagem`)
- **6 entidades de despesa** (`multas`, `abastecimentos`, `manutencoes`, `impostos`, `seguros`, `documentacoes`)
- **1 tabela de auditoria** (`impostos_historicos`)
- **1 tabela de configuração** (`configuracoes`)

Detalhe completo do schema, relacionamentos e diagrama em **[`docs/ERD.md`](./docs/ERD.md)**.

### Padrões

- Soft delete via `data_hora_exclusao IS NULL`
- Categorização sempre via FK para tabela auxiliar `tipos_*` / `status_*` / `situacoes_*` / `perfis_*` (nunca enum no banco)
- Timestamps: `data_hora_criacao`, `data_hora_atualizacao`, `data_hora_exclusao`
- Sem `TIMESTAMPTZ` — banco e containers em `TZ=America/Sao_Paulo`

---

## API

Documentação interativa em **`http://localhost:3001/api`** (Swagger) com todos os endpoints, schemas, exemplos e botão "Try it out".

### Endpoints principais

| Recurso | Operações |
|---|---|
| `POST /auth/login` | Login com matrícula + senha → JWT (7 dias) |
| `GET\|POST\|PUT\|DELETE /usuarios` | CRUD de operadores/motoristas |
| `GET\|POST\|PUT\|DELETE /veiculos` | CRUD da frota |
| `GET\|POST\|PUT\|DELETE /viagens` | CRUD + `/iniciar`, `/finalizar`, `/posicoes` |
| `GET\|POST\|PATCH\|DELETE /multas` | (idem para abastecimentos, manutencoes, impostos, seguros, documentacoes) |
| `GET /impostos/:id/historicos` | Trilha de auditoria de impostos |
| `GET /lookups/:nome` | Lista lookup de qualquer tabela auxiliar |
| `GET /relatorios/distancia-motorista` | Total km por motorista no período |
| `GET /relatorios/distancia-veiculo` | Total km por veículo no período |
| `GET /alertas` | CNH vencendo, viagens atrasadas, manutenções devidas, etc. |

Todas as rotas (exceto `/auth/login`) requerem `Authorization: Bearer <jwt>`.

---

## Convenções do código

Veja [`CLAUDE.md`](./CLAUDE.md) para o documento completo. Resumo:

- **PT-BR** em todo código de domínio (entidades, variáveis, mensagens de erro, commits)
- **Strict TypeScript** — proibido `any`, `// @ts-ignore`
- **Conventional Commits em PT-BR**: `feat: adiciona endpoint X`, `fix: corrige cálculo Y`
- **Datas sempre via** `@fleetops/utils/datetime` — nunca `new Date()` direto
- **Forms** sempre com React Hook Form + Zod
- **Server Components por padrão** no Next 15; `'use client'` só na borda de interatividade

---

## Tarefas comuns

```bash
# Tudo em dev (turbo paraleliza api + web)
bun run dev

# Lint + typecheck
bun run lint
bunx tsc --noEmit               # em cada app

# Tests
cd apps/api && bun run test     # unit (jest)
cd apps/web && bun test:e2e     # Playwright

# Migrations
cd apps/api
bunx prisma migrate dev --name minha_alteracao
bunx prisma studio              # GUI do banco

# Resetar dev do zero
bunx prisma migrate reset --force
```

---

## Deploy

| Componente | Hosting | Branch que dispara |
|---|---|---|
| API | Railway (`projeto-frota.up.railway.app`) | `main` push |
| Web | Vercel (`projeto-frota-web.vercel.app`) | `main` push |
| Mobile | EAS Build (manual) | tag |
| DB prod | Supabase (Session Pooler) | migration manual |

Procedimento completo em **[`DEPLOY_CHECKLIST.md`](./DEPLOY_CHECKLIST.md)**.

### Variáveis de ambiente

| App | Variável | Notas |
|---|---|---|
| API | `DATABASE_URL` | Supabase Session Pooler porta 5432 |
| API | `JWT_SECRET` | 64+ caracteres aleatórios |
| API | `MAPBOX_TOKEN` | Geocoding + Directions |
| API | `TZ` | `America/Sao_Paulo` |
| Web | `API_URL` | URL pública da API |
| Web | `NEXT_PUBLIC_MAPBOX_TOKEN` | mesmo token (inlinado no bundle) |
| Mobile | `EXPO_PUBLIC_API_URL` | IP LAN em dev; URL pública em prod |

---

## Status

**MVP em desenvolvimento.** Recentemente concluído o refactor `schema-snake-case-reset`:

- ✅ Schema normalizado (UUID → INT + camelCase → snake_case + tipos como FK)
- ✅ Despesas extraídas em 6 tabelas separadas + auditoria de impostos
- ✅ API completa (12 módulos, Swagger documentado)
- ✅ Web completa (CRUD de tudo + despesas com tabs + forms)
- ✅ Mobile com GPS real-time + push notifications
- ✅ Endpoint dinâmico `/lookups/:nome` para dropdowns
- ✅ Typecheck + jest verdes (13 testes / 8 suites)

Roadmap pós-MVP em [`PRD-FleetOps-MVP.md`](./PRD-FleetOps-MVP.md).

---

## Licença

Proprietário. Uso interno.

---

## Documentação

- **[CLAUDE.md](./CLAUDE.md)** — Convenções, regras de nomenclatura, proibições, padrões por camada
- **[PRD-FleetOps-MVP.md](./PRD-FleetOps-MVP.md)** — Requisitos do produto e escopo do MVP
- **[REFACTOR.md](./REFACTOR.md)** — Histórico e detalhes do refactor schema-snake-case
- **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** — Procedimento de deploy de produção
- **[docs/ERD.md](./docs/ERD.md)** — Diagrama entidade-relacionamento completo
