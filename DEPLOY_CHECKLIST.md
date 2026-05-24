# Checklist de Deploy — refactor schema-snake-case-reset

**Branch:** `refactor/schema-snake-case-reset`
**Risco:** ALTO — operação destrutiva no Supabase prod (UUID → INT migration apaga dados).

---

## ⚠️ Pré-deploy obrigatório

### 1. Backup do Supabase prod

No painel Supabase → **Database** → **Backups** → criar snapshot manual ANTES de qualquer migration.

Alternativa local:
```bash
pg_dump $DATABASE_URL_PROD > backup-pre-refactor-$(date +%Y%m%d-%H%M).sql
```

Guarde o backup em local seguro (não no repo, não no Drive corporativo expostos).

### 2. Rotacionar senha do Supabase

A senha foi exposta em chat durante esta sessão (`pZQ122w1A9Qd6ukd`). Trocar **antes** do deploy:

1. Supabase → Settings → Database → Reset database password
2. Atualizar `DATABASE_URL` no Railway (API)
3. Atualizar `DATABASE_URL` local nos `.env` se necessário

---

## 🚀 Deploy

### Passo 1 — Reset destrutivo do Supabase prod

```bash
cd apps/api
# Confirme que DATABASE_URL aponta para Supabase prod
echo $DATABASE_URL  # deve mostrar host *.supabase.com

# Aplica TODAS as migrations do refactor + executa o seed principal
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION=sim bunx prisma migrate reset --force
```

**O que acontece:**
- Drop de todas as tabelas antigas (UUID era)
- Cria 22 tabelas novas (schema_snake_case_int_ids + add_expo_push_token)
- Roda `prisma/seed.ts` (cria admin `0000000001` / `Admin@123456` + 9 lookups + configuração sede)

### Passo 2 — Seed inicial de teste (opcional)

```bash
bunx tsx prisma/seed-motorista-teste.ts
```

Cria motorista `0000001234` / `12341234` + 2 veículos + 4 viagens (CRIADA/EM_ANDAMENTO/FINALIZADA).

### Passo 3 — Variáveis de ambiente

#### Railway (API)

Na UI do Railway, no serviço da API:

| Variável | Valor |
|---|---|
| `MAPBOX_TOKEN` | **(setar)** — token do Mapbox para geocoding/directions |
| `DATABASE_URL` | URL do Supabase Session Pooler (porta 5432) |
| `JWT_SECRET` | manter o atual |
| `TZ` | `America/Sao_Paulo` |

#### Vercel (web)

Na UI do Vercel, projeto `projeto-frota-web`, **Settings → Environment Variables**:

| Variável | Valor |
|---|---|
| `API_URL` | URL pública da API no Railway |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | **(setar)** — mesmo token público do Mapbox |

Depois clique em **Deployments → ... → Redeploy** e **DESMARQUE** `Use existing Build Cache` (envs `NEXT_PUBLIC_*` são inlinadas no bundle, cache antigo guarda valores antigos).

### Passo 4 — Validação smoke

Após deploy completo:

1. Abrir `https://projeto-frota-web.vercel.app/login`
2. Login com `0000000001` / `Admin@123456`
3. Verificar:
   - Dashboard carrega
   - `/veiculos` lista veículos do seed
   - `/veiculos/{id}/despesas` mostra tabs (vazias)
   - Criar uma multa → aparece na lista
   - Criar uma viagem
4. App mobile:
   - Login com `0000001234` / `12341234`
   - Lista de viagens aparece
   - Detalhe de viagem com mapa carrega

### Passo 5 — Merge

Após validação completa em prod:

```bash
git checkout main
git merge refactor/schema-snake-case-reset --no-ff
git push origin main
```

---

## 🚨 Plano de rollback

Se algo der errado após o reset do Supabase:

1. Voltar branch:
   ```bash
   cd apps/api
   git checkout main
   # Restaurar migrations antigas
   mv prisma/migrations.OLD-uuid-snapshot prisma/migrations
   ```

2. Restaurar backup do Supabase:
   ```bash
   psql $DATABASE_URL_PROD < backup-pre-refactor-YYYYMMDD-HHMM.sql
   ```

3. Redeploy Railway + Vercel a partir de `main`

---

## ⏳ Pendências pós-deploy (não bloqueiam)

- **Specs** em `apps/api/src/modulos/.OLD-specs-uuid-snapshot/` — reescrever com mocks novos
- **Scripts data-fix** em `apps/api/scripts/.OLD-uuid-snapshot/` — reescrever se forem reusados
- **Componentes web de despesas** — testar visualmente os 6 forms (multas, abastecimentos, manutenções, impostos, seguros, documentações)
- **EAS Build** do mobile com a nova URL da API
