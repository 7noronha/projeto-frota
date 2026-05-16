# CLAUDE.md — FleetOps

> Este arquivo define as **regras, convenções e padrões obrigatórios** que devem ser seguidos em TODAS as interações com este projeto. Leia este arquivo **antes de qualquer tarefa**. Ele complementa o `PRD-FleetOps-MVP.md`.

---

## 🎯 Sobre o Projeto

**FleetOps** é um sistema corporativo de gestão de frota de veículos, composto por:

1. **API (Backend)** — NestJS 11 + Fastify 5 + Prisma 6 + PostgreSQL 17
2. **Web (Operador)** — Next.js 15 (App Router) + shadcn/ui + Tailwind 4
3. **Mobile (Motorista)** — React Native + Expo 55 + Gluestack UI v2

**Escopo atual:** MVP — fluxo de viagens (criar → iniciar → finalizar).

---

## 📏 Regras Globais — NÃO NEGOCIÁVEIS

### 1. Idioma
- **Todo código de domínio em PT-BR**: nomes de entidades, propriedades, tabelas, colunas, variáveis de negócio, mensagens de erro, DTOs, comentários.
- **Código técnico pode ser em EN**: palavras do framework, keywords do TypeScript, métodos HTTP, nomes de libs.
- **Commits em PT-BR** seguindo Conventional Commits (ex.: `feat: adiciona endpoint de criar viagem`).

✅ CORRETO:
```typescript
class Viagem {
  motoristaId: string;
  odometroInicial: number;
  dataHoraInicioReal: Date;
}
```

❌ ERRADO:
```typescript
class Trip {
  driverId: string;
  initialOdometer: number;
}
```

### 2. Nomenclatura

| Contexto | Padrão | Exemplo |
|---|---|---|
| **Classes/Entidades TS** | PascalCase PT-BR | `Usuario`, `Veiculo`, `Viagem` |
| **Variáveis/Funções TS** | camelCase PT-BR | `odometroInicial`, `calcularDistancia()` |
| **Tabelas PostgreSQL** | snake_case plural PT-BR | `usuarios`, `veiculos`, `viagens` |
| **Colunas PostgreSQL** | snake_case PT-BR | `data_criacao`, `motorista_id` |
| **Enums/Status** | MAIUSCULAS_COM_UNDERSCORE | `CRIADA`, `EM_ANDAMENTO`, `FINALIZADA` |
| **Arquivos** | kebab-case | `viagem.service.ts`, `criar-viagem.dto.ts` |
| **Pastas** | kebab-case | `viagens/`, `auth/`, `common/` |
| **Componentes React** | PascalCase | `TabelaViagens.tsx`, `CardVeiculo.tsx` |
| **Hooks** | camelCase com `use` | `useListarViagens()`, `useAuth()` |

### 3. Mapeamento Prisma

**Sempre** use `@map` para converter camelCase (Prisma) para snake_case (banco):

```prisma
model Usuario {
  id              String    @id @default(uuid())
  matricula       String    @unique @db.VarChar(10)
  nome            String    @db.VarChar(200)
  senhaHash       String    @map("senha_hash") @db.VarChar(255)

  dataCriacao     DateTime  @default(now()) @map("data_criacao") @db.Timestamp(6)
  dataAtualizacao DateTime  @updatedAt @map("data_atualizacao") @db.Timestamp(6)
  dataExclusao    DateTime? @map("data_exclusao") @db.Timestamp(6)

  @@map("usuarios")
}
```

### 4. Fuso Horário — CRÍTICO

- **Nunca use UTC** diretamente em lugar algum.
- **Todos os timestamps** são persistidos como `TIMESTAMP WITHOUT TIME ZONE` em fuso `America/Sao_Paulo`.
- **Sempre use o utilitário central** `packages/utils/datetime.ts` — nunca `new Date()` diretamente em código de produção.

✅ CORRETO:
```typescript
import { agoraBrasilia, formatarDataBrasilia } from '@fleetops/utils/datetime';

const agora = agoraBrasilia();
```

❌ ERRADO:
```typescript
const agora = new Date();                  // fuso da máquina
const utc = new Date().toISOString();      // UTC (proibido)
```

Containers (`api`, `postgres`) devem ter `TZ=America/Sao_Paulo`.

### 5. Versões — Sempre a LTS mais recente

Ao instalar qualquer dependência nova, use a **última versão estável/LTS** disponível. Não fixe em versões antigas sem justificativa.

Versões mínimas do projeto (Maio/2026):

- Node.js **24 LTS**
- NestJS **11.x**
- Next.js **15.x**
- React **19.2.x**
- React Native **0.83.x** (alinhado ao Expo SDK 55.0.x via `expo install`)
- Expo SDK **55.x**
- Prisma **6.x**
- Tailwind **4.x**
- PostgreSQL **17**
- TypeScript **5.7+**

> As versões nativas do mobile (React Native, expo-*, react-native-safe-area-context, react) são governadas pelo Expo SDK. Ao adicionar libs nativas use sempre `expo install` e mantenha tudo com `expo install --check` verde — não fixe manualmente versões divergentes do SDK.

### 6. TypeScript — Strict Mode

- `"strict": true` em todos os `tsconfig.json`
- Proibido usar `any` — use `unknown` e refine com type guards
- Proibido usar `// @ts-ignore` — use `// @ts-expect-error` com motivo documentado
- Toda função pública deve ter tipo de retorno explícito

---

## 🏗️ Estrutura do Monorepo

```
fleetops/
├── apps/
│   ├── api/                  # NestJS + Fastify
│   ├── web/                  # Next.js 15
│   └── mobile/               # Expo
├── packages/
│   ├── types/                # DTOs e tipos compartilhados
│   ├── validation/           # Schemas Zod compartilhados
│   ├── config/               # eslint-config, tsconfig base, tailwind base
│   └── utils/                # datetime.ts, formatadores, helpers
├── docker-compose.yml
├── turbo.json
├── package.json
├── PRD-FleetOps-MVP.md       # fonte de verdade do produto
└── CLAUDE.md                 # este arquivo
```

### Regras de Dependência Entre Packages

- `apps/*` pode importar de `packages/*`
- `packages/*` **não importa** de `apps/*`
- `packages/types` é o mais básico — não importa de outros packages
- `packages/validation` pode importar de `types`
- `packages/utils` é puro (sem dependências do monorepo)

---

## 🔧 Convenções por Camada

### API (NestJS + Fastify)

#### Estrutura de módulos

Cada domínio segue a estrutura:

```
src/modulos/viagens/
├── dto/
│   ├── criar-viagem.dto.ts
│   ├── atualizar-viagem.dto.ts
│   └── iniciar-viagem.dto.ts
├── viagens.controller.ts
├── viagens.service.ts
├── viagens.module.ts
└── viagens.service.spec.ts
```

#### Padrões obrigatórios

- Controllers apenas **orquestram** — toda regra de negócio vai no Service.
- Services recebem **DTOs tipados**, nunca `any`.
- Toda rota precisa de:
  - `@ApiTags()` e `@ApiOperation()` para Swagger
  - Guard de autenticação (exceto `/auth/login`)
  - Validação de DTO via `ValidationPipe` global
- Erros de negócio: lançar exceções do NestJS (`BadRequestException`, `NotFoundException`, `ForbiddenException`, `ConflictException`).
- **Nunca retorne `senhaHash`** em respostas — sempre use DTO de resposta filtrado.

#### Exemplo — Controller

```typescript
@ApiTags('Viagens')
@Controller('viagens')
@UseGuards(JwtAuthGuard)
export class ViagensController {
  constructor(private readonly viagensService: ViagensService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova viagem' })
  @Roles('admin', 'operador')
  async criar(
    @Body() dto: CriarViagemDto,
    @UsuarioAutenticado() usuario: UsuarioJwt,
  ): Promise<ViagemResponse> {
    return this.viagensService.criar(dto, usuario.sub);
  }
}
```

#### Middleware de Observabilidade

O middleware `LoggerMiddleware` (seção 5 do PRD) está registrado globalmente e **não deve ser contornado**. Se precisar logar algo extra, use logs do NestJS (`Logger`) dentro do service.

### Web (Next.js 15)

- **Server Components por padrão.** Use `'use client'` apenas quando necessário (estado, eventos, hooks de navegador).
- **Params são `Promise`** no Next.js 15 — sempre `await`:

```typescript
type Params = Promise<{ id: string }>;

export default async function PaginaViagem(props: { params: Params }) {
  const { id } = await props.params;
  // ...
}
```

- **Data fetching** via TanStack Query em Client Components; via `fetch` + cache do Next em Server Components.
- **Formulários** sempre com React Hook Form + Zod (schemas de `packages/validation`).
- **Componentes shadcn/ui** em `components/ui/`; componentes de domínio em `components/<dominio>/`.
- **Tailwind 4** — use as CSS variables da paleta (seção 9.2 do PRD), não hex hardcoded.

### Mobile (Expo 55 + Gluestack UI v2)

- **Expo Router** para navegação (file-based).
- **Gluestack UI** para todos os componentes — não misturar com outras libs de UI.
- **JWT** armazenado em `expo-secure-store` (nunca `AsyncStorage`).
- **TanStack Query** para data fetching, com `staleTime` adequado.
- **Telas pequenas e focadas** — motorista usa em condições adversas (sol, pressa, pouco tempo).

---

## 🔐 Autenticação

### Login
- **Identificador:** `matricula` (10 dígitos, ex.: `0009003656`)
- **Senha:** bcrypt com salt rounds = 10
- **JWT:** único, validade de **7 dias**, sem refresh token
- **Payload:** `{ sub, matricula, nome, perfil, iat, exp }`

### Armazenamento do Token
- **Web:** cookie HttpOnly + Secure + SameSite=Lax
- **Mobile:** `expo-secure-store`

### Guards e Decorators
- `@UseGuards(JwtAuthGuard)` em todos os controllers (exceto `/auth/login`)
- `@Roles('admin', 'operador')` para controle de papéis
- `@UsuarioAutenticado()` decorator customizado para extrair o usuário do request

---

## 🗄️ Banco de Dados

### Convenções

- Toda tabela tem: `id` (UUID), `data_criacao`, `data_atualizacao`, `data_exclusao`
- Toda query de listagem deve filtrar `data_exclusao IS NULL` (exclusão lógica)
- Toda FK segue o padrão `<entidade>_id` (ex.: `motorista_id`, `veiculo_id`)
- UUIDs são gerados pela aplicação (`@default(uuid())` no Prisma), não pelo banco

### Migrations

- **Sempre** criadas via `prisma migrate dev --name descricao_em_pt_br`
- Nome da migration em snake_case PT-BR (ex.: `criar_tabela_viagens`, `adicionar_campo_observacoes_veiculos`)
- **Não editar migrations já commitadas** — criar uma nova migration para corrigir

### Seeds

- Seed inicial deve criar ao menos:
  - 1 usuário `admin` (matrícula `0000000001`, senha temporária)
  - 1 registro em `configuracoes` com chave `endereco_sede`

---

## 🧪 Testes

### Regras

- Todo service tem arquivo `.spec.ts` correspondente
- Cobertura mínima: **70% de services** (regra de negócio)
- Testes E2E nos fluxos críticos: login, criar viagem, iniciar viagem, finalizar viagem
- CI **bloqueia merge** se algum teste falhar

### Padrão AAA (Arrange, Act, Assert)

```typescript
describe('ViagensService.criar', () => {
  it('deve criar uma viagem com status CRIADA', async () => {
    // Arrange
    const dto = mockCriarViagemDto();
    const operadorId = 'uuid-operador';

    // Act
    const viagem = await service.criar(dto, operadorId);

    // Assert
    expect(viagem.status).toBe('CRIADA');
    expect(viagem.operadorCriadorId).toBe(operadorId);
  });

  it('deve lançar conflito se veiculo já estiver em viagem', async () => {
    // ...
  });
});
```

### Nomes dos testes

- Sempre começam com **"deve"** + ação esperada
- Em PT-BR
- Descrevem comportamento, não implementação

---

## 📝 Git e Commits

### Conventional Commits em PT-BR

Formato: `<tipo>: <descrição no imperativo>`

Tipos:
- `feat` — nova funcionalidade
- `fix` — correção de bug
- `refactor` — refatoração sem mudar comportamento
- `test` — adição ou ajuste de testes
- `docs` — documentação
- `chore` — tarefas de manutenção (deps, config)
- `style` — formatação, sem impacto no código
- `perf` — melhoria de performance

Exemplos:
```
feat: adiciona endpoint para iniciar viagem
fix: corrige cálculo de distância percorrida
refactor: extrai validação de CNH para utilitário
test: adiciona cenários para criação de viagem com conflito
```

### Branch Naming

- `feat/<descricao-curta>` — ex.: `feat/criar-viagem`
- `fix/<descricao-curta>` — ex.: `fix/validacao-odometro`
- `chore/<descricao-curta>` — ex.: `chore/atualiza-prisma`

---

## 🚫 Proibições Explícitas

O Claude Code **NUNCA deve**:

1. ❌ Usar `new Date()` direto em código de produção — use o utilitário de datetime
2. ❌ Usar `TIMESTAMPTZ` ou timestamps UTC no Postgres
3. ❌ Nomear entidades/tabelas/colunas em inglês (exceto código técnico de framework)
4. ❌ Usar `any` em TypeScript
5. ❌ Retornar `senhaHash` ou qualquer dado sensível em responses
6. ❌ Pular validação de DTO (usar `@Body() dto: any` é proibido)
7. ❌ Fazer deleção física de registros — sempre soft delete via `data_exclusao`
8. ❌ Criar migrations sem revisão do schema antes
9. ❌ Commitar arquivos `.env` — apenas `.env.example`
10. ❌ Usar bibliotecas de UI diferentes de shadcn/ui (web) ou Gluestack (mobile)
11. ❌ Adicionar refresh tokens, 2FA ou recovery de senha no MVP
12. ❌ Fazer merge sem revisão e sem testes verdes

---

## 📦 Instalação e Setup Esperado

### Pré-requisitos do ambiente

- Node.js 24 LTS (via `nvm` ou `fnm`)
- Docker + Docker Compose
- Bun (para dev)
- Git

### Comandos úteis (documentar à medida que forem criados)

```bash
# Subir ambiente local
docker compose up -d

# Rodar migrations
cd apps/api && npx prisma migrate dev

# Rodar tudo em dev
bun run dev                # via turbo

# Rodar testes
bun run test               # via turbo
bun run test:e2e

# Lint e format
bun run lint
bun run format
```

---

## 🎨 Design System

### Paleta (resumida — ver PRD seção 9.2)

Use **sempre** as CSS variables do Tailwind config:

```css
--primary: #0066FF
--primary-dark: #0047B3
--navy: #0A2540
--accent-cyan: #00C2FF
--blue-light: #E6F0FF
```

Tipografia:
- **Web:** Inter (via `next/font/google`)
- **Mobile:** System fonts

---

## 🤝 Ao Iniciar Qualquer Tarefa

Antes de começar a codar, o Claude Code deve:

1. ✅ Ler o `PRD-FleetOps-MVP.md` na seção relevante
2. ✅ Verificar este `CLAUDE.md`
3. ✅ Confirmar que entende o escopo (pedir esclarecimento se houver ambiguidade)
4. ✅ Propor um plano de execução antes de criar/editar arquivos em grande escala
5. ✅ Validar que o código segue as convenções de nomenclatura e idioma
6. ✅ Ao final, rodar lint e testes antes de declarar a tarefa concluída

---

## 📚 Documentação de Referência

- **PRD do projeto:** `PRD-FleetOps-MVP.md`
- **NestJS + Fastify:** https://docs.nestjs.com/techniques/performance
- **Prisma:** https://www.prisma.io/docs
- **Next.js 15:** https://nextjs.org/docs/app
- **shadcn/ui:** https://ui.shadcn.com/
- **Gluestack UI v2:** https://gluestack.io/
- **Expo 55:** https://docs.expo.dev/
- **Turborepo:** https://turbo.build/repo/docs
- **Tailwind 4:** https://tailwindcss.com/docs

---

## 💬 Comunicação com o Desenvolvedor

- Todas as respostas do Claude Code devem ser em **PT-BR**
- Sempre **explicar decisões técnicas** quando houver mais de um caminho
- **Sugerir melhorias** quando identificar oportunidades (mas não aplicar sem autorização)
- **Avisar imediatamente** se uma tarefa exigir violar alguma regra deste documento
- **Pedir confirmação** antes de operações destrutivas (deletar migrations, resetar banco, etc.)

---

**Última atualização:** Maio/2026
**Versão deste documento:** 1.0
