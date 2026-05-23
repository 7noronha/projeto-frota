# Refactor: schema snake_case + INT IDs + tipos como FK

**Branch:** `refactor/schema-snake-case-reset`
**Status:** Em andamento. Backend não compila.
**Motivação:** Normalizar schema (extrair impostos + outras subcategorias de despesas, transformar tipo-strings em FKs pra tabelas auxiliares), padronizar nomenclatura.

---

## Convenções adotadas

### Banco / Prisma
- **Models** em `snake_case` plural (igual ao nome da tabela)
- **IDs** `Int @id @default(autoincrement())` — substitui UUIDs antigos
- **Timestamps**: `data_hora_criacao`, `data_hora_atualizacao`, `data_hora_exclusao` (soft delete)
- **FKs de tipo/status** sempre apontam pra tabela auxiliar `_id` (ex: `perfil_id` → `perfis_usuario.id`)
- **Colunas** em `snake_case` puro (sem `@map` necessário)

### Código TS
- Acessa modelo Prisma com nome snake_case: `prisma.usuarios.findFirst(...)` (não `prisma.usuario`)
- Tipos compartilhados em `@fleetops/types` também em snake_case (`UsuarioResposta.cnh_validade`, `data_hora_criacao`)
- DTOs com campos em snake_case: `perfil_id`, `cnh_validade`, `ano_fabricacao`, etc

---

## Estado atual

### ✅ Pronto

- `prisma/schema.prisma` — schema novo completo (todas as 22 tabelas)
- `prisma/migrations/20260523004059_schema_snake_case_int_ids/` — migration inicial
- `prisma/migrations/20260523005225_add_expo_push_token_usuarios/` — coluna push token
- `prisma/seed.ts` — popula 9 lookups + admin (matrícula 0000000001, senha Admin@123456)
- `packages/types/src/index.ts` — todos os tipos refatorados
- `packages/validation/src/index.ts` — schemas Zod refatorados (`schemaId` substituiu `schemaUuid`)
- `apps/api/src/modulos/auth/auth.service.ts`
- `apps/api/src/modulos/configuracoes/configuracoes.service.ts`
- `apps/api/src/modulos/configuracoes/dto/configuracao-resposta.dto.ts`
- `apps/api/src/modulos/usuarios/usuarios.service.ts`
- `apps/api/src/modulos/usuarios/dto/criar-usuario.dto.ts`

### ⏳ Falta (em ordem sugerida pra próximas sessões)

#### Sessão 2: terminar usuarios + auth + veiculos

- [ ] `usuarios/dto/atualizar-usuario.dto.ts` (perfil string → perfil_id INT)
- [ ] `usuarios/dto/filtros-listar-usuarios.dto.ts` (perfil → perfil_id, validar)
- [ ] `usuarios/dto/usuario-resposta.dto.ts` (id string → number, perfil string → ItemLookup)
- [ ] `usuarios/dto/push-token.dto.ts` (ajustar)
- [ ] `usuarios/usuarios.controller.ts` (id params Int, decorators @Roles atualizados)
- [ ] `auth/dto/*` (3 DTOs)
- [ ] `auth/auth.controller.ts`
- [ ] `auth/strategies/jwt.strategy.ts` (payload sub: number)
- [ ] `auth/guards/jwt-auth.guard.ts` (provavelmente OK)
- [ ] `common/decorators/usuario-autenticado.decorator.ts` (deve estar OK)
- [ ] `common/guards/roles.guard.ts` (perfil agora vem do FK, mas no JWT já é string nome)
- [ ] `veiculos/veiculos.service.ts` (situacao string → situacao_id INT)
- [ ] `veiculos/veiculos.controller.ts`
- [ ] `veiculos/dto/*` (3 DTOs)

#### Sessão 3: viagens (módulo central)

- [ ] `viagens/viagens.service.ts` (status string → status_id INT, todas as relations include status/motorista/veiculo)
- [ ] `viagens/viagens.controller.ts`
- [ ] `viagens/dto/*` (6 DTOs)
- [ ] Geocoding + Directions services (não mudam muito)
- [ ] Velocidade service (já existe, só ajustar)

#### Sessão 4: despesas SPLIT em 6 módulos

Hoje existe `apps/api/src/modulos/despesas/` com 1 service tabelão. Tem que virar 6 módulos novos:

- [ ] `apps/api/src/modulos/multas/` (service + controller + 3 DTOs + module)
- [ ] `apps/api/src/modulos/abastecimentos/`
- [ ] `apps/api/src/modulos/manutencoes/`
- [ ] `apps/api/src/modulos/impostos/` (+ uso de impostos_historicos)
- [ ] `apps/api/src/modulos/seguros/`
- [ ] `apps/api/src/modulos/documentacoes/`
- [ ] Delete `apps/api/src/modulos/despesas/`
- [ ] Registrar os 6 novos modules em `app.module.ts`

Endpoints REST:
- `GET/POST/PUT/DELETE /multas`
- `GET/POST/PUT/DELETE /abastecimentos`
- `GET/POST/PUT/DELETE /manutencoes`
- `GET/POST/PUT/DELETE /impostos`
- `GET/POST/PUT/DELETE /seguros`
- `GET/POST/PUT/DELETE /documentacoes`

#### Sessão 5: alertas + relatorios + specs

- [ ] `alertas/alertas.service.ts` — usa todas as tabelas, refazer queries
- [ ] `relatorios/relatorios.service.ts`
- [ ] Atualizar 9 specs: novos mocks com INT IDs + objetos perfil/status/situacao

#### Sessão 6: scripts + lookups endpoint

- [ ] `apps/api/scripts/redistribuir-15km.ts` — adapta pra INT IDs
- [ ] `apps/api/scripts/alinhar-sede.ts` — idem
- [ ] `apps/api/scripts/backfill-prod.ts` — idem
- [ ] `apps/api/scripts/setar-sede-salto.ts` — idem
- [ ] `prisma/seed-motorista-teste.ts` — rescrever com perfil_id, situacao_id, status_id
- [ ] Criar módulo `lookups` na API: `GET /lookups/perfis`, `GET /lookups/tipos-combustivel`, etc — pro frontend popular dropdowns

#### Sessão 7: web (Next.js)

- [ ] `apps/web/lib/api-servidor.ts` — tipos ajustados
- [ ] Todas as Server Actions com IDs (de string → number)
- [ ] Todos os componentes (`DetalheViagem`, `FormViagem`, listas) — ~40 arquivos
- [ ] Server Components — ajustar params (`{ id: string }` → `{ id: number }` ou keep `string` + coerção)
- [ ] Dropdowns de perfil/status/situacao via novos endpoints `/lookups/*`

#### Sessão 8: mobile (Expo)

- [ ] `C:\fleetops-mobile\tipos.ts` — vendorizado, atualizar
- [ ] Telas: `app/(motorista)/viagens/[id].tsx`, `app/(motorista)/index.tsx`, `app/(motorista)/abastecimento.tsx`
- [ ] Componentes: `MapaAcompanhamento`, `InfoDistancia`
- [ ] Hook `useEnviarPosicao` — viagemId agora é number

#### Sessão 9: deploy

- [ ] Migrar Supabase prod: rodar migration nova, perder dados antigos (4 viagens + usuários) — acordar com user, e seed com dados frescos
- [ ] Atualizar `EXPO_PUBLIC_API_URL` se mudar (provavelmente não)
- [ ] Deploy Railway (auto via push) + Vercel (manual com redeploy sem cache pra inlinear env)

---

## Como retomar (próxima sessão)

1. Abrir nova conversa com Claude
2. Mensagem inicial sugerida:
   > "Continue o refactor schema-snake-case-reset. Leia REFACTOR.md no repo pra contexto. Comece pela Sessão 2."

3. Claude vai:
   - Ler este arquivo
   - Conferir status do git (`git log --oneline -10`)
   - Pegar a próxima caixa não-marcada e atacar

---

## Banco local atual

Reset feito em 22/05/2026. Estado:
- 0 usuários (exceto admin do seed)
- 0 veículos
- 0 viagens
- 9 lookups populados pelo seed

Pra reiniciar do zero: `cd apps/api && bunx prisma migrate reset --force` (precisa de consent pra agent AI).

## Banco prod (Supabase)

**NÃO foi tocado.** Continua com schema antigo (UUIDs, etc). A migração de prod só rola na Sessão 9, quando o backend novo estiver pronto.

---

**Próximo passo IMEDIATO**: Sessão 2 — terminar `usuarios` DTOs + `auth` + `veiculos`.
