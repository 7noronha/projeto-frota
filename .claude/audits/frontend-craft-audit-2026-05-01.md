# Frontend Craft Audit — FleetOps Web
**Data:** 2026-05-05  
**Escopo:** `apps/web` — somente leitura  
**Auditor:** Claude (Fase 1 do processo frontend-craft)

---

## 1. Stack Real Detectada

| Categoria | Em uso real | Instalado mas não usado |
|---|---|---|
| Framework | Next.js 15 (App Router, RSC) | — |
| Linguagem | TypeScript 5.7+ strict | — |
| Estilo | Tailwind CSS 4 + inline `style={}` | — |
| Componentes | PrimeReact 10.8 | `components/ui/` (shadcn remnants) |
| Ícones | PrimeIcons 7 (`pi pi-*`) | — |
| Forms | `useActionState` + Server Actions | React Hook Form 7.54 + Zod (instalaods, não usados) |
| Tabelas | PrimeReact `DataTable` | TanStack Table v8 (instalado, não usado) |
| Data fetching | `fetch` em Server Components | TanStack Query v5 (instalado, não usado) |
| Fontes | Inter via `next/font/google` | — |
| Animação | Nenhuma | — |
| Toasts | PrimeReact `Message` (inline) | Sonner (não instalado) |
| State global | Não aplicado | Zustand (não instalado) |
| Command palette | Não implementado | cmdk (não instalado) |

**Observações críticas:**
- O projeto optou por `useActionState` + Server Actions em vez de React Hook Form — abordagem válida para App Router, mas perde validação inline por campo.
- 3 dependências pesadas estão instaladas e consumindo bundle sem uso: `@tanstack/react-table`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`.
- `components/ui/` contém 7 arquivos shadcn (badge, button, card, input, label, select, textarea) — nenhum é importado em lugar algum.

---

## 2. Estrutura de Pastas Relevante

```
apps/web/
├── app/
│   ├── (dashboard)/               # Route group — layout com sidebar
│   │   ├── layout.tsx             # Shell: sidebar + main
│   │   ├── veiculos/
│   │   │   ├── page.tsx           # Listagem (Server Component)
│   │   │   ├── actions.ts         # Server Actions
│   │   │   ├── novo/page.tsx      # Cadastro (SC + Client Form)
│   │   │   └── [id]/editar/page.tsx # Edição (SC + Client Form)
│   │   └── viagens/
│   │       ├── page.tsx           # Listagem com filtros (SC)
│   │       ├── actions.ts         # Server Actions
│   │       ├── nova/page.tsx      # Nova viagem (SC + Client Form)
│   │       └── [id]/page.tsx      # Detalhe + iniciar/finalizar (SC)
│   ├── api/auth/sair/route.ts     # Route handler de logout
│   ├── login/
│   │   ├── page.tsx               # Layout split (SC)
│   │   ├── FormularioLogin.tsx    # Client Component
│   │   ├── IlustracaoAuth.tsx     # SVG inline (SC)
│   │   └── actions.ts             # Server Action de login
│   ├── globals.css                # Reset + tokens PrimeReact + .login-field
│   ├── layout.tsx                 # Root layout + Providers
│   └── page.tsx                   # Redirect para /veiculos
├── components/
│   ├── layout/
│   │   └── NavegacaoPrincipal.tsx # Sidebar (Client Component)
│   ├── providers.tsx              # PrimeReactProvider wrapper
│   ├── ui/                        # 7 arquivos shadcn — DEAD CODE
│   ├── veiculos/
│   │   ├── FormVeiculo.tsx        # Client Component
│   │   └── TabelaVeiculos.tsx     # Client Component
│   └── viagens/
│       ├── FormViagem.tsx         # Client Component
│       ├── FormIniciarViagem.tsx  # Client Component
│       ├── FormFinalizarViagem.tsx# Client Component
│       └── TabelaViagens.tsx      # Client Component
├── lib/
│   ├── api-servidor.ts            # fetchServidor + ErroApi
│   └── utils.ts
└── middleware.ts                  # Proteção de rotas
```

---

## 3. Tokens de Design

### O que existe

`globals.css` expõe algumas variáveis CSS para o PrimeReact:

```css
:root {
  --primary-color: #0066ff;
  --primary-color-text: #ffffff;
  --highlight-bg: #e6f0ff;
  --highlight-text-color: #0066ff;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

### O que está faltando

- **Sem tokens semânticos Tailwind** (`--background`, `--foreground`, `--card`, `--muted`, `--muted-foreground`, `--border`, `--ring`, etc.)
- **Cores primárias da marca estão hardcoded** em dezenas de `style={}` por toda a codebase:
  - `#0A2540` (navy) — 14+ ocorrências inline
  - `#0066FF` (primary) — 20+ ocorrências inline
  - `#64748b` (secondary text) — 10+ ocorrências inline
  - `#f8fafc` (background) — 5+ ocorrências inline
- **Sem escala de spacing padronizada** — valores arbitrários misturados com Tailwind (`px-3`, `py-2.5`, `gap-5`, etc.)
- Paleta definida no PRD (`--primary`, `--navy`, `--accent-cyan`, `--blue-light`) existe como documentação mas não como CSS variables consumíveis

---

## 4. Telas / Rotas Principais

| Rota | Tipo | Componente principal | Função |
|---|---|---|---|
| `/login` | SC público | `PaginaLogin` | Autenticação |
| `/` | SC | `PaginaRaiz` | Redireciona para /veiculos |
| `/veiculos` | SC | `PaginaVeiculos` | Listagem de veículos |
| `/veiculos/novo` | SC + Client | `PaginaNovoVeiculo` | Cadastro de veículo |
| `/veiculos/[id]/editar` | SC + Client | `PaginaEditarVeiculo` | Edição de veículo |
| `/viagens` | SC | `PaginaViagens` | Listagem com filtros |
| `/viagens/nova` | SC + Client | `PaginaNovaViagem` | Criação de viagem |
| `/viagens/[id]` | SC | `PaginaDetalheViagem` | Detalhe + iniciar/finalizar |

**Rotas não implementadas** (previstas no PRD): `/usuarios`, `/relatorios`

---

## 5. Componentes Compartilhados de UI

### Em uso

| Componente | Arquivo | Tipo | Usado em |
|---|---|---|---|
| `NavegacaoPrincipal` | `components/layout/` | Client | `(dashboard)/layout.tsx` |
| `Providers` | `components/providers.tsx` | Client wrapper | `app/layout.tsx` |
| `TabelaViagens` | `components/viagens/` | Client | `viagens/page.tsx` |
| `TabelaVeiculos` | `components/veiculos/` | Client | `veiculos/page.tsx` |
| `FormViagem` | `components/viagens/` | Client | `viagens/nova/page.tsx` |
| `FormVeiculo` | `components/veiculos/` | Client | `veiculos/novo/`, `[id]/editar/` |
| `FormIniciarViagem` | `components/viagens/` | Client | `viagens/[id]/page.tsx` |
| `FormFinalizarViagem` | `components/viagens/` | Client | `viagens/[id]/page.tsx` |

### Dead code (nunca importado)

`components/ui/badge.tsx`, `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `textarea.tsx` — são remanescentes da configuração shadcn/ui original. Podem ser removidos com segurança.

---

## 6. Padrões de A11y — Amostra de 3 Componentes

### 6.1 `NavegacaoPrincipal.tsx` — Avaliação: REPROVADO

| Item | Status | Detalhe |
|---|---|---|
| `<aside>` semântico | OK | Elemento correto para sidebar |
| `aria-label` na sidebar | AUSENTE | `<aside>` sem label — leitor de tela anuncia "complementar" sem contexto |
| `aria-current="page"` | AUSENTE | `ativo` é calculado mas nunca exposto via ARIA |
| Focus visível | AUSENTE | Hover state só via `onMouseEnter`/`onMouseLeave` inline — teclado não recebe feedback visual |
| `<nav>` com label | AUSENTE | `<nav>` sem `aria-label="Navegação principal"` |
| Botão logout | OK | Usa `<button>` via PrimeReact Button |

**Código problemático:**
```tsx
// NavegacaoPrincipal.tsx:40-62
// ativo calculado, mas não exposto
const ativo = pathname.startsWith(item.href);

<div  // <-- deveria ser aria-current no Link, não no div interno
  onMouseEnter={(e) => { ... }}  // hover sem equivalente de focus
  onMouseLeave={(e) => { ... }}
>
```

### 6.2 `FormVeiculo.tsx` — Avaliação: PARCIAL

| Item | Status | Detalhe |
|---|---|---|
| `<label htmlFor>` em inputs de texto | OK | `destino`, `marca`, `modelo`, `cor`, `renavam`, `dataAquisicao`, `observacoes` corretos |
| `<label>` para Dropdown/InputNumber | AUSENTE | Labels de situação, anoFabricacao, anoModelo, odômetro não têm `htmlFor` e os componentes não têm `id` correspondente |
| Asterisco obrigatório acessível | AUSENTE | `<span style={{ color: '#ef4444' }}>*</span>` sem `aria-hidden="true"` — leitor de tela lê "asterisco" |
| `aria-invalid` por campo | AUSENTE | Nenhum campo marca `aria-invalid="true"` em caso de erro |
| `aria-describedby` por campo | AUSENTE | Erros não são associados aos campos via ARIA |
| Erro global acessível | PARCIAL | `Message` severity="error" existe mas sem `role="alert"` explícito |
| `autoComplete` | AUSENTE | Nenhum campo de texto em FormVeiculo tem `autoComplete` |

**Código problemático:**
```tsx
// FormVeiculo.tsx:58-63
<label className="text-sm font-medium">  // sem htmlFor
  Situação <span style={{ color: '#ef4444' }}>*</span>  // sem aria-hidden
</label>
<input type="hidden" name="situacao" value={situacao} />
<Dropdown ... />  // sem inputId
```

### 6.3 `TabelaVeiculos.tsx` — Avaliação: REPROVADO

| Item | Status | Detalhe |
|---|---|---|
| `confirm()` nativo para exclusão | GRAVE | Não é acessível, não pode ser testado, bloqueia event loop, sem opção para screen reader navegar |
| Botão excluir sem contexto | AUSENTE | `aria-label="Excluir"` sem identificar qual veículo — problema grave para screen readers |
| `<table>` semântica | OK via PrimeReact | PrimeReact gera `<table>` com `<thead>`/`<tbody>` corretos |
| `aria-sort` em colunas | AUSENTE | DataTable sem ordenação configurada — mas headers sem indicação de que ordenação é possível |
| Caption da tabela | AUSENTE | Sem `<caption>` acessível |
| Touch targets | PARCIAL | Botões "Editar" e "Excluir" com `padding: '0.25rem 0.5rem'` — abaixo dos 44x44px mínimos em mobile |

**Código problemático:**
```tsx
// TabelaVeiculos.tsx:33
if (!confirm(`Tem certeza...`)) return;  // confirm() — anti-pattern crítico de a11y

// TabelaVeiculos.tsx:68
<Button label="Excluir" ... />  // sem aria-label identificando qual veículo
```

---

## 7. Inventário de Anti-Patterns (com arquivo e linha)

### AP-01 — Emoji em UI (REGRA INEGOCIÁVEL VIOLADA)
**Arquivo:** `app/login/page.tsx:63`
```tsx
<h1>Bem-vindo de volta 👋</h1>
```
**Princípio:** Regra inegociável da skill: ZERO emojis. Usar ícone PrimeIcons.

---

### AP-02 — Hover-only state sem equivalente de foco (a11y)
**Arquivo:** `components/layout/NavegacaoPrincipal.tsx:51-62`
```tsx
onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
// Sem focus-visible equivalente
```
**Princípio:** Em touch e teclado, hover não existe. Estado de foco deve ser visível.

---

### AP-03 — `confirm()` nativo para ação destrutiva
**Arquivo:** `components/veiculos/TabelaVeiculos.tsx:33`
```tsx
if (!confirm(`Tem certeza que deseja excluir o veículo ${placa}?`)) return;
```
**Princípio:** Anti-pattern crítico — não acessível, não estilizável, bloqueia thread. Usar Dialog de confirmação com campo de digitação para ação irreversível.

---

### AP-04 — Cores hardcoded via inline style (40+ ocorrências)
**Arquivos:** todos os `page.tsx`, `NavegacaoPrincipal.tsx`, formulários
```tsx
// viagens/page.tsx:32
style={{ color: '#0A2540' }}
// viagens/page.tsx:36
style={{ color: '#64748b' }}
// NavegacaoPrincipal.tsx:27
style={{ background: '#0A2540' }}
```
**Princípio:** Componentes devem consumir tokens semânticos — não cores cruas. Dificulta theming, dark mode e consistência.

---

### AP-05 — `aria-current` ausente na navegação ativa
**Arquivo:** `components/layout/NavegacaoPrincipal.tsx:44-51`
```tsx
const ativo = pathname.startsWith(item.href);
// 'ativo' muda o visual mas não expõe aria-current="page"
```
**Princípio:** Links de navegação ativos devem ter `aria-current="page"`.

---

### AP-06 — Labels sem `htmlFor` para PrimeReact Dropdown/InputNumber
**Arquivo:** `components/veiculos/FormVeiculo.tsx:58-72`
```tsx
<label className="text-sm font-medium">Situação *</label>
<Dropdown value={situacao} ... />  // sem inputId
```
**Princípio:** Todo input precisa de label associado via `htmlFor`/`id`.

---

### AP-07 — Ausência de skeleton/loading.tsx em qualquer rota
**Arquivos:** todos os `page.tsx` em `(dashboard)/`
Nenhuma rota possui `loading.tsx`. Sem Suspense boundaries para Server Components. Usuário vê tela em branco durante o carregamento inicial.
**Princípio:** Skeleton > spinner. Sem skeleton, sem `loading.tsx`, carregamento = tela branca.

---

### AP-08 — Paginação sem `aria-label` descritivo e sem `aria-current`
**Arquivo:** `app/(dashboard)/viagens/page.tsx:78-90`, `veiculos/page.tsx:55-67`
```tsx
<Link href={`/viagens?pagina=${p}`} ...>
  {p}  // só o número, sem contexto
</Link>
// Sem aria-current nem aria-label="Página 3 de 7"
```

---

### AP-09 — Filtros e paginação não sincronizados (perda de estado)
**Arquivo:** `app/(dashboard)/viagens/page.tsx`
Ao filtrar por status, a paginação não é resetada para página 1. Ao paginar, a URL perde os filtros se o usuário usar os links de paginação diretamente (eles apontam só para `?pagina=N` sem preservar filtros).

---

### AP-10 — Dead code: `components/ui/` (7 arquivos)
**Arquivos:** `components/ui/badge.tsx`, `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `textarea.tsx`
Nenhum é importado em parte alguma do projeto. Remanescente de configuração shadcn nunca removido.

---

### AP-11 — Dead dependencies no package.json
```json
"@tanstack/react-query": "^5.63.0",    // instalado, não usado
"@tanstack/react-table": "^8.20.0",    // instalado, não usado
"react-hook-form": "^7.54.0",          // instalado, não usado
"@hookform/resolvers": "^3.9.0",       // instalado, não usado
```

---

## 8. Estados de UI Ausentes — Amostra de 5 Telas

### Tela 1: `/veiculos`

| Estado | Presente | Observação |
|---|---|---|
| Empty inicial | PARCIAL | Texto inline em `emptyMessage` do DataTable — sem ícone, sem CTA estruturado |
| Empty filtro vazio | AUSENTE | Sem filtros nesta tela ainda; mas quando implementado não há distinção |
| Loading inicial (skeleton) | AUSENTE | Sem `loading.tsx`, sem Suspense — tela branca durante fetch |
| Loading background | AUSENTE | N/A (não há refetch) |
| Error com retry | AUSENTE | Sem `error.tsx` — erro de rede resulta em tela quebrada não tratada |
| Forbidden | AUSENTE | 403 da API não tem tratamento diferenciado |

---

### Tela 2: `/viagens`

| Estado | Presente | Observação |
|---|---|---|
| Empty inicial | PARCIAL | `emptyMessage` inline — sem ícone, sem estrutura de empty state |
| Empty filtro vazio | PARCIAL | Há link "Limpar filtros" na página, mas o DataTable usa o mesmo `emptyMessage` seja com filtros ou sem |
| Loading inicial (skeleton) | AUSENTE | Sem `loading.tsx`, sem Suspense |
| Loading background | AUSENTE | N/A |
| Error com retry | AUSENTE | Sem `error.tsx` |
| Forbidden | AUSENTE | — |

---

### Tela 3: `/viagens/[id]` (detalhe)

| Estado | Presente | Observação |
|---|---|---|
| 404 | OK | `notFound()` chamado corretamente |
| Loading inicial (skeleton) | AUSENTE | Sem Suspense — tela em branco durante fetch |
| Partial/streaming | AUSENTE | Tudo carrega em bloco — sem boundaries por seção |
| Error com retry | PARCIAL | Erro é relançado mas sem `error.tsx` no route segment para capturar |
| Forbidden (403) | AUSENTE | 403 lança exceção genérica, não tem página de "acesso negado" |
| Stale data | AUSENTE | N/A |

---

### Tela 4: `/veiculos/novo` e `/veiculos/[id]/editar`

| Estado | Presente | Observação |
|---|---|---|
| Loading do form | AUSENTE | Sem skeleton do formulário durante carregamento da página |
| Validação inline por campo | AUSENTE | Só erro global via `Message` no final do form — campos não mostram erro individual |
| Loading durante submit | OK | `loading={pendente}` no botão de submit |
| Erro de rede durante submit | PARCIAL | Erro via `estado?.erro` — mas genérico, sem retry estruturado |
| Sucesso com feedback | AUSENTE | Após submit bem-sucedido ocorre redirect sem confirmação visual |

---

### Tela 5: `/login`

| Estado | Presente | Observação |
|---|---|---|
| Erro de credenciais | OK | `Message` severity="error" com texto claro |
| Loading durante submit | OK | `Button loading={pendente}` |
| Validação inline por campo | AUSENTE | Sem erro por campo (matricula inválida, senha curta) |
| Erro de rede | PARCIAL | Mensagem genérica — não diferencia "sem internet" de "servidor offline" |
| Sessão expirada (redirect) | AUSENTE | Não há banner de "sessão expirada" ao ser redirecionado para login |

---

## 9. Conflitos Potenciais Entre o Projeto e a Skill

| Conflito | Impacto | Resolução |
|---|---|---|
| **Biblioteca de componentes**: skill define shadcn/ui; projeto usa PrimeReact | Baixo | Regra da tarefa: não trocar. Adaptar princípios à stack PrimeReact. |
| **Formulários sem RHF+Zod inline**: skill exige blur validation por campo; projeto usa `useActionState` + erro global | Alto | Adicionar validação client-side por campo via Zod diretamente sem RHF, ou adotar RHF em formulários complexos. |
| **Tokens semânticos ausentes**: skill exige `--background`, `--foreground`, etc.; projeto usa hex inline | Alto | Criar CSS variables semânticas em `globals.css` e migrar inline styles para classes Tailwind. |
| **Ícones**: skill usa lucide-react; projeto usa PrimeIcons | Nulo | Regra da tarefa: manter PrimeIcons. |
| **Dead dependencies** (RHF, TanStack Query/Table) | Médio | Remover ou utilizar. |
| **`confirm()` nativo**: skill exige dialogs acessíveis | Alto | Criar componente `DialogConfirmacao` com PrimeReact Dialog. |
| **Hover-only states**: skill exige focus/touch equivalentes | Médio | Adicionar `:focus-within` e `focus-visible` no CSS do sidebar. |
| **Emoji no código**: violação de regra inegociável | Crítico | Remover o 👋 de `login/page.tsx`. |
| **Sem skeleton loaders**: skill exige skeleton > spinner | Alto | Criar `loading.tsx` para cada route segment + skeletons. |
| **Sem `error.tsx`**: skill exige error state com retry | Alto | Criar `error.tsx` por route segment com componente de erro acessível. |
| **Paginação sem preservação de filtros** | Médio | Sincronizar filtros e paginação via `searchParams` completos nos hrefs de paginação. |
| **Dead code `components/ui/`** | Baixo | Remover os 7 arquivos não usados. |

---

## Resumo Executivo

O projeto tem uma base sólida: App Router corretamente estruturado, Server Components por padrão, TypeScript strict, autenticação via cookie HttpOnly, nomes em PT-BR consistentes. A migração para PrimeReact está funcional.

Os principais débitos de qualidade, em ordem de impacto:

1. **Estados de UI ausentes** — nenhuma rota tem `loading.tsx` ou `error.tsx`. O usuário vê tela em branco durante carregamento e tela quebrada em caso de erro de rede.
2. **Acessibilidade do sidebar** — sem `aria-current`, sem focus visível, sem `aria-label` na nav.
3. **Validação inline ausente** — formulários só mostram erro global; nenhum campo marca `aria-invalid` nem exibe mensagem de erro adjacente.
4. **Cores hardcoded** — 40+ ocorrências de inline styles com hex — dificulta consistência e qualquer futura customização de tema.
5. **`confirm()` nativo** — anti-pattern de a11y crítico na exclusão de veículos.
6. **Emoji em produção** — viola regra inegociável da skill.
7. **Dead code e dependências** — 7 arquivos UI não usados, 4 dependências pesadas instaladas sem uso.
