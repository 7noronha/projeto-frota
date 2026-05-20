# Testes E2E (Playwright)

Cobertura mínima dos fluxos críticos do operador admin no web:

- `login.spec.ts` — credencial inválida, login bem-sucedido, redirect de rota privada, validação Zod cliente
- `navegacao.spec.ts` — sidebar com 8 itens, navegação para cada rota, botão "Sair"
- `viagens.spec.ts` — fluxo crítico criar → iniciar → finalizar + validações de hora/data (PRD §8.6)
  - Pré-requisito extra: `cd apps/api && bunx tsx prisma/seed-motorista-teste.ts`
    (motorista ativo com CNH + 1 veículo). O spec dá `test.skip` se faltar motorista.

## Como rodar localmente

Pré-requisito: API + Web rodando.

```bash
# 1. Em um terminal — sobe os dois apps em modo dev
bun run dev:app

# 2. Em outro — primeira vez instala o navegador
cd apps/web && bun run e2e:install

# 3. Rodar todos os testes
bun run e2e

# Ou modo interativo (UI)
bun run e2e:ui
```

## Pressupostos

- API em `http://localhost:3001` com o seed admin executado
  (`bun run prisma:seed`) — matrícula `0000000001`, senha `Admin@123456`
- Web em `http://localhost:3000`
- Override via `E2E_BASE_URL` para apontar para staging:
  `E2E_BASE_URL=https://staging.fleetops.com bun run e2e`

## CI

O `playwright.config.ts` está pronto para CI:

- `forbidOnly` em CI
- `retries: 1` em CI, `0` localmente
- `workers: 1` (serializa porque os testes mexem em dados de viagens)
- HTML report em `playwright-report/`

Para CI completo, precisa também subir API + DB de teste antes
de rodar (não tem `webServer` nesse arquivo).
