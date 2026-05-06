# Frontend Craft — Plano de Refatoração
**Data:** 2026-05-05  
**Base:** auditoria `frontend-craft-audit-2026-05-01.md`  
**Branch alvo:** `refactor/frontend-craft-adoption`

---

## Ordem de execução (maior ROI × menor risco → maior risco)

| # | PR | Risco | Tempo est. | Estrela |
|---|---|---|---|---|
| 1 | Limpeza de dead code e dependências | Baixo | 20 min | — |
| 2 | Emoji, `aria-current` e focus visível na sidebar | Baixo | 30 min | ★ TOP 3 |
| 3 | `loading.tsx` + skeleton loaders | Baixo | 45 min | ★ TOP 3 |
| 4 | `error.tsx` + componente EstadoErro | Baixo | 30 min | ★ TOP 3 |
| 5 | Empty states estruturados | Baixo-médio | 45 min | — |
| 6 | Paginação com filtros sincronizados | Médio | 30 min | — |
| 7 | Dialog de confirmação para exclusão | Médio | 45 min | — |
| 8 | Tokens semânticos e migração de inline styles | Médio | 60 min | — |
| 9 | Validação inline por campo nos formulários | Médio-alto | 90 min | — |

---

## PRs Detalhados

---

### PR 1 — Limpeza de dead code e dependências
**Risco:** Baixo | **Tempo:** 20 min

**Princípio:** Remove ruído que polui o projeto e causa confusão (componentes nunca usados, dependências instaladas sem uso).

**Arquivos afetados:**
- `components/ui/badge.tsx` — REMOVER
- `components/ui/button.tsx` — REMOVER
- `components/ui/card.tsx` — REMOVER
- `components/ui/input.tsx` — REMOVER
- `components/ui/label.tsx` — REMOVER
- `components/ui/select.tsx` — REMOVER
- `components/ui/textarea.tsx` — REMOVER
- `apps/web/package.json` — remover `@tanstack/react-query`, `@tanstack/react-table`, `react-hook-form`, `@hookform/resolvers`

**Antes:**
```
components/ui/          # 7 arquivos, 0 importações
package.json:
  "@hookform/resolvers": "^3.9.0",    # não usado
  "@tanstack/react-query": "^5.63.0", # não usado
  "@tanstack/react-table": "^8.20.0", # não usado
  "react-hook-form": "^7.54.0",       # não usado
```

**Depois:**
```
components/ui/          # diretório removido
package.json:           # 4 dependências removidas
```

**Critérios de validação:**
- `bun run typecheck` sem erros
- `bun run build` sem erros
- Nenhum arquivo do projeto importa de `@/components/ui/` ou das libs removidas

---

### PR 2 — Emoji, `aria-current` e focus visível na sidebar ★ TOP 3
**Risco:** Baixo | **Tempo:** 30 min

**Princípio:** Remove violação de regra inegociável (emoji), corrige a11y crítica da navegação (`aria-current`, `aria-label`, focus visível via teclado).

**Arquivos afetados:**
- `app/login/page.tsx`
- `components/layout/NavegacaoPrincipal.tsx`
- `app/globals.css`

**Mudança 1 — Remover emoji:**
```tsx
// ANTES — login/page.tsx:63
<h1>Bem-vindo de volta 👋</h1>

// DEPOIS
<h1>Bem-vindo de volta</h1>
```

**Mudança 2 — `aria-label` + `aria-current` + focus visível na sidebar:**
```tsx
// ANTES — NavegacaoPrincipal.tsx
<aside style={{ background: '#0A2540', ... }}>
  <nav className="...">
    {itensMenu.map((item) => {
      const ativo = pathname.startsWith(item.href);
      return (
        <Link key={item.href} href={item.href}>
          <div
            onMouseEnter={...}
            onMouseLeave={...}
          >
            ...
          </div>
        </Link>
      );
    })}
  </nav>
</aside>

// DEPOIS
<aside aria-label="Navegação principal" style={...}>
  <nav aria-label="Menu">
    {itensMenu.map((item) => {
      const ativo = pathname.startsWith(item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={ativo ? 'page' : undefined}
          className="nav-item"  // classe CSS para focus-visible
        >
          ...
        </Link>
      );
    })}
  </nav>
</aside>
```

**Mudança 3 — CSS para hover + focus (globals.css):**
```css
/* Sidebar nav — hover e focus via CSS, não via onMouseEnter */
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  color: rgba(255,255,255,0.65);
  text-decoration: none;
  transition: background 150ms ease-out, color 150ms ease-out;
}
.nav-item:hover,
.nav-item:focus-visible {
  background: rgba(255,255,255,0.08);
  color: #ffffff;
  outline: 2px solid rgba(255,255,255,0.3);
  outline-offset: 2px;
}
.nav-item[aria-current="page"] {
  background: #0066FF;
  color: #ffffff;
}
```

**Critérios de validação:**
- Nenhum emoji no código (`grep -r "👋\|😀\|🚀"` retorna vazio)
- Navegar pelo sidebar só com Tab — item ativo tem outline visível
- Elemento ativo tem `aria-current="page"` no DOM (inspecionar)
- `<aside>` tem `aria-label` no DOM

---

### PR 3 — `loading.tsx` + skeleton loaders ★ TOP 3
**Risco:** Baixo | **Tempo:** 45 min

**Princípio:** Skeleton > spinner. Tela branca durante carregamento é a falha de UX mais visível do projeto. Só adiciona arquivos, não modifica existentes.

**Arquivos novos:**
- `app/(dashboard)/veiculos/loading.tsx`
- `app/(dashboard)/viagens/loading.tsx`
- `app/(dashboard)/viagens/[id]/loading.tsx`
- `components/veiculos/TabelaVeiculosSkeleton.tsx`
- `components/viagens/TabelaViagensSkeleton.tsx`
- `components/viagens/DetalheViagemSkeleton.tsx`

**Exemplo — TabelaVeiculosSkeleton.tsx:**
```tsx
export function TabelaVeiculosSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200">
      {/* Header */}
      <div className="flex gap-4 bg-slate-50 px-4 py-3">
        {[120, 160, 80, 80, 120, 100, 120].map((w, i) => (
          <div key={i} className="h-3 animate-pulse rounded bg-slate-200" style={{ width: w }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 border-t border-slate-100 px-4 py-4">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
```

**Exemplo — veiculos/loading.tsx:**
```tsx
import { TabelaVeiculosSkeleton } from '@/components/veiculos/TabelaVeiculosSkeleton';

export default function Loading() {
  return (
    <div>
      {/* Cabeçalho skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-200" />
      </div>
      <TabelaVeiculosSkeleton />
    </div>
  );
}
```

**Critérios de validação:**
- Ao simular rede lenta (DevTools → Network → Slow 3G), a rota `/veiculos` exibe o skeleton antes do conteúdo
- Skeleton tem a mesma largura de coluna aproximada da tabela real (sem layout shift perceptível)
- Nenhum spinner de tela cheia

---

### PR 4 — `error.tsx` + componente EstadoErro ★ TOP 3
**Risco:** Baixo | **Tempo:** 30 min

**Princípio:** Error state recuperável com retry — estado #6 dos 7 obrigatórios. Só adiciona arquivos, não modifica nada existente.

**Arquivos novos:**
- `components/EstadoErro.tsx` — componente reutilizável
- `app/(dashboard)/veiculos/error.tsx`
- `app/(dashboard)/viagens/error.tsx`
- `app/(dashboard)/viagens/[id]/error.tsx`

**EstadoErro.tsx:**
```tsx
'use client';

import { Button } from 'primereact/button';

interface EstadoErroProps {
  titulo?: string;
  descricao?: string;
  onTentarNovamente: () => void;
}

export function EstadoErro({
  titulo = 'Não conseguimos carregar os dados',
  descricao = 'Pode ser uma instabilidade temporária. Tente novamente em instantes.',
  onTentarNovamente,
}: EstadoErroProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border px-6 py-12 text-center"
      style={{ borderColor: '#fca5a5', background: '#fef2f2' }}
    >
      <i className="pi pi-exclamation-circle" style={{ fontSize: '2rem', color: '#ef4444' }} />
      <h3 className="mt-3 text-base font-semibold" style={{ color: '#1e293b' }}>
        {titulo}
      </h3>
      <p className="mt-1 max-w-sm text-sm" style={{ color: '#64748b' }}>
        {descricao}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button
          label="Tentar novamente"
          icon="pi pi-refresh"
          outlined
          size="small"
          onClick={onTentarNovamente}
        />
        <Button
          label="Falar com suporte"
          text
          size="small"
          onClick={() => window.open('mailto:ti@empresa.com')}
        />
      </div>
    </div>
  );
}
```

**veiculos/error.tsx:**
```tsx
'use client';

import { EstadoErro } from '@/components/EstadoErro';

export default function ErrorVeiculos({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <EstadoErro
      titulo="Não conseguimos carregar os veículos"
      onTentarNovamente={reset}
    />
  );
}
```

**Critérios de validação:**
- Ao desligar a API e acessar `/veiculos`, a página exibe o `EstadoErro` com botão "Tentar novamente"
- O botão "Tentar novamente" chama `reset()` e re-executa o Server Component
- `role="alert"` presente no DOM

---

### PR 5 — Empty states estruturados
**Risco:** Baixo-médio | **Tempo:** 45 min

**Princípio:** Empty state inicial e de filtro são estados distintos com CTAs diferentes.

**Arquivos afetados:**
- `components/EstadoVazio.tsx` — NOVO
- `components/EstadoVazioFiltro.tsx` — NOVO
- `components/veiculos/TabelaVeiculos.tsx` — MODIFICAR `emptyMessage`
- `components/viagens/TabelaViagens.tsx` — MODIFICAR `emptyMessage`
- `app/(dashboard)/viagens/page.tsx` — MODIFICAR lógica de empty

**Antes (emptyMessage inline sem estrutura):**
```tsx
emptyMessage={
  <div className="text-center py-8">
    <p style={{ color: '#64748b' }}>Nenhuma viagem encontrada.</p>
    <Link href="/viagens/nova">Criar primeira viagem</Link>
  </div>
}
```

**Depois — componente estruturado:**
```tsx
// components/EstadoVazio.tsx
export function EstadoVazio({ icone, titulo, descricao, cta }: EstadoVazioProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-20 text-center"
      style={{ borderColor: '#cbd5e1', background: '#f8fafc' }}>
      <div className="rounded-full p-3" style={{ background: '#f1f5f9' }}>
        <i className={icone} style={{ fontSize: '1.5rem', color: '#94a3b8' }} />
      </div>
      <h3 className="mt-4 text-sm font-semibold" style={{ color: '#1e293b' }}>{titulo}</h3>
      <p className="mt-1 max-w-sm text-sm" style={{ color: '#64748b' }}>{descricao}</p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}
```

**Critérios de validação:**
- Com banco vazio, `/veiculos` exibe ícone + título + descrição + botão "Cadastrar primeiro veículo"
- Em `/viagens` com filtro ativo retornando vazio, exibe ícone de busca + "Limpar filtros"
- Sem filtros ativos e banco vazio, exibe CTA de criação

---

### PR 6 — Paginação com filtros sincronizados
**Risco:** Médio | **Tempo:** 30 min

**Princípio:** Estado de URL — filtros e paginação devem ser preservados juntos nos `searchParams`.

**Arquivos afetados:**
- `app/(dashboard)/viagens/page.tsx`
- `app/(dashboard)/veiculos/page.tsx`

**Antes (paginação perde filtros):**
```tsx
<Link href={`/viagens?pagina=${p}`}>  // perde status, dataInicio, dataFim
  {p}
</Link>
```

**Depois:**
```tsx
function hrefPagina(p: number, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  if (params.status) sp.set('status', params.status);
  if (params.dataInicio) sp.set('dataInicio', params.dataInicio);
  if (params.dataFim) sp.set('dataFim', params.dataFim);
  sp.set('pagina', String(p));
  return `/viagens?${sp.toString()}`;
}

// Nos links de paginação:
<Link
  href={hrefPagina(p, params)}
  aria-label={`Página ${p}${p === pagina ? ' (atual)' : ''}`}
  aria-current={p === pagina ? 'page' : undefined}
>
  {p}
</Link>
```

**Critérios de validação:**
- Filtrar por status "Em andamento", depois clicar na página 2 → URL contém `?status=EM_ANDAMENTO&pagina=2`
- Voltar e avançar no histórico do browser preserva filtros e página
- `aria-current="page"` presente no botão da página ativa

---

### PR 7 — Dialog de confirmação para exclusão
**Risco:** Médio | **Tempo:** 45 min

**Princípio:** Ação destrutiva irreversível exige confirmação acessível — não `confirm()` nativo. Para "Excluir veículo" (ação de alto impacto), um Dialog com campo de digitação obrigatória.

**Arquivos afetados:**
- `components/DialogConfirmacao.tsx` — NOVO
- `components/veiculos/TabelaVeiculos.tsx` — MODIFICAR

**DialogConfirmacao.tsx:**
```tsx
'use client';

import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

interface DialogConfirmacaoProps {
  visivel: boolean;
  titulo: string;
  descricao: string;
  palavraConfirmacao: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  carregando?: boolean;
}

export function DialogConfirmacao({
  visivel, titulo, descricao, palavraConfirmacao,
  onConfirmar, onCancelar, carregando,
}: DialogConfirmacaoProps) {
  const [texto, setTexto] = useState('');
  const confirmado = texto === palavraConfirmacao;

  return (
    <Dialog
      visible={visivel}
      onHide={onCancelar}
      header={titulo}
      style={{ width: 420 }}
      closable={!carregando}
    >
      <p className="text-sm mb-4" style={{ color: '#475569' }}>{descricao}</p>
      <label className="text-sm font-medium" style={{ color: '#374151' }}>
        Digite <strong>{palavraConfirmacao}</strong> para confirmar
      </label>
      <InputText
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="w-full mt-2"
        autoComplete="off"
      />
      <div className="flex justify-end gap-3 mt-6">
        <Button label="Cancelar" outlined severity="secondary" onClick={onCancelar} disabled={carregando} />
        <Button
          label={carregando ? 'Excluindo...' : 'Excluir'}
          severity="danger"
          loading={carregando}
          disabled={!confirmado}
          onClick={onConfirmar}
        />
      </div>
    </Dialog>
  );
}
```

**Critérios de validação:**
- Clicar em "Excluir" abre o Dialog, não o `confirm()` nativo
- Botão de confirmação fica desabilitado até digitar a placa correta
- Pressionar Esc fecha o dialog sem excluir
- Foco retorna ao botão "Excluir" que abriu o dialog após fechar

---

### PR 8 — Tokens semânticos e migração de inline styles
**Risco:** Médio | **Tempo:** 60 min

**Princípio:** Componentes consomem tokens semânticos — não cores cruas. Facilita consistência e qualquer futura customização de tema.

**Arquivos afetados:**
- `app/globals.css` — MODIFICAR: adicionar CSS variables semânticas
- `app/(dashboard)/veiculos/page.tsx` — substituir inline styles
- `app/(dashboard)/viagens/page.tsx` — substituir inline styles
- `app/(dashboard)/viagens/[id]/page.tsx` — substituir inline styles
- `components/layout/NavegacaoPrincipal.tsx` — substituir inline styles (parcial — ver PR 2)

**globals.css — adicionar após tokens PrimeReact:**
```css
:root {
  /* Paleta semântica FleetOps — baseada no PRD seção 9.2 */
  --fo-navy: #0A2540;
  --fo-primary: #0066FF;
  --fo-primary-dark: #0047B3;
  --fo-primary-light: #E6F0FF;
  --fo-accent: #00C2FF;

  /* Texto */
  --fo-text: #1e293b;
  --fo-text-secondary: #64748b;
  --fo-text-muted: #94a3b8;

  /* Superfícies */
  --fo-bg: #f8fafc;
  --fo-surface: #ffffff;
  --fo-border: #e2e8f0;
  --fo-border-subtle: #f1f5f9;
}
```

**Antes → Depois (exemplo em viagens/page.tsx):**
```tsx
// ANTES
<h1 style={{ color: '#0A2540' }}>Viagens</h1>
<p style={{ color: '#64748b' }}>...</p>

// DEPOIS — via classe Tailwind com var CSS
<h1 className="text-2xl font-bold text-[--fo-navy]">Viagens</h1>
<p className="mt-1 text-sm text-[--fo-text-secondary]">...</p>
```

**Critérios de validação:**
- `grep -r "style={{ color:" apps/web/app` retorna zero ou apenas casos justificados
- Visual permanece idêntico ao antes (comparar screenshots antes/depois)
- `bun run typecheck` verde

---

### PR 9 — Validação inline por campo nos formulários
**Risco:** Médio-alto | **Tempo:** 90 min

**Princípio:** Erros de validação inline abaixo do campo com `aria-invalid` + `aria-describedby`. Validar no blur, não no change.

**Arquivos afetados:**
- `components/viagens/FormViagem.tsx`
- `components/veiculos/FormVeiculo.tsx`
- `app/login/FormularioLogin.tsx`

**Estratégia:** Não introduzir React Hook Form (dependência removida no PR 1). Usar estado local `touched` + validação Zod client-side por campo em `onBlur`.

**Antes (sem validação inline):**
```tsx
<InputText id="destino" name="destino" required />
// Sem feedback até o submit
```

**Depois:**
```tsx
const [erros, setErros] = useState<Record<string, string>>({});
const [tocados, setTocados] = useState<Record<string, boolean>>({});

function validarCampo(nome: string, valor: string) {
  const resultado = schemaCampos[nome]?.safeParse(valor);
  setErros((prev) => ({
    ...prev,
    [nome]: resultado?.success ? '' : (resultado?.error.errors[0]?.message ?? ''),
  }));
}

<div className="flex flex-col gap-1.5">
  <label htmlFor="destino" className="text-sm font-medium">
    Destino <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
    <span className="sr-only">(obrigatório)</span>
  </label>
  <InputText
    id="destino"
    name="destino"
    aria-invalid={tocados.destino && !!erros.destino ? 'true' : 'false'}
    aria-describedby={erros.destino ? 'destino-erro' : undefined}
    onBlur={(e) => {
      setTocados((p) => ({ ...p, destino: true }));
      validarCampo('destino', e.target.value);
    }}
  />
  {tocados.destino && erros.destino && (
    <p id="destino-erro" role="alert" className="text-xs" style={{ color: '#ef4444' }}>
      {erros.destino}
    </p>
  )}
</div>
```

**Critérios de validação:**
- Sair de campo vazio obrigatório mostra erro abaixo do campo
- Campo com erro tem borda vermelha (via PrimeReact `.p-invalid` class)
- `aria-invalid="true"` presente no DOM quando há erro
- Submeter form com campos inválidos não dispara Server Action
- Não valida durante digitação — só no blur

---

## O que NÃO vai mudar e por quê

| Item | Motivo |
|---|---|
| **Biblioteca PrimeReact** | Regra da tarefa: não trocar libs. PrimeReact está funcional e é consistente |
| **PrimeIcons** | Regra da tarefa: manter ícones do projeto |
| **`useActionState` + Server Actions** | Padrão correto para Next.js 15 App Router. RHF seria regressão arquitetural |
| **Estrutura de rotas e URL scheme** | Roteamento correto, App Router bem estruturado |
| **Autenticação (JWT + cookie HttpOnly)** | Fora do escopo de UI |
| **`lib/api-servidor.ts`** | Lógica de negócio/API — fora do escopo |
| **`middleware.ts`** | Proteção de rotas — fora do escopo |
| **Server Actions** | Lógica de negócio/dados — fora do escopo |
| **Nomes em PT-BR** | Convenção correta do CLAUDE.md — manter |
| **Fontes (Inter)** | Escolha correta e consistente com a skill |
| **Theme PrimeReact `lara-light-blue`** | Funciona bem, customizado via CSS variables |

---

## PRs com Maior ROI × Menor Risco (TOP 3)

### ★ PR 2 — Emoji, `aria-current` e focus visível
**Por quê:** Remove a única violação de regra inegociável (emoji), corrige a a11y mais visível do projeto (sidebar sem `aria-current`), e adiciona focus visível via teclado. Tudo feito com mudanças pontuais e zero risco de quebra funcional.

### ★ PR 3 — `loading.tsx` + skeleton loaders
**Por quê:** A ausência de feedback de carregamento é o problema de UX mais perceptível para o usuário final. Só adiciona arquivos novos — risco de regressão zero. Impacto imediato e mensurável.

### ★ PR 4 — `error.tsx` + componente EstadoErro
**Por quê:** Protege todas as rotas do dashboard contra telas quebradas em caso de erro de rede ou falha da API. Só adiciona arquivos novos. Transforma um cenário de "tela branca" em experiência recuperável com retry.
