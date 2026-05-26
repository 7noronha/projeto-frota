# FleetOps
## Sistema corporativo de gestão de frota de veículos

Plataforma multi-cliente (web + mobile) com rastreamento em tempo real, gestão de despesas e workflow completo de viagens corporativas.

---

# O problema

Empresas com frota própria perdem dinheiro e produtividade por:

- **Sem visibilidade** de onde os veículos estão em tempo real
- **Despesas dispersas** — multas, combustível, manutenção, IPVA, seguro, documentação em planilhas separadas (ou pior, papel)
- **Alertas reativos** — só descobrem que a CNH ou o seguro venceu quando vira problema
- **Comunicação manual** entre operação (escritório) e motoristas (rua)
- **Auditoria difícil** — quem aprovou, quem rodou, quanto km, qual destino real

---

# A solução

Aplicação **operador → motorista** end-to-end:

- 🖥️ **Web (operador)** — cadastra motoristas/veículos, cria e acompanha viagens, gerencia despesas, vê alertas e relatórios
- 📱 **Mobile (motorista)** — recebe viagens atribuídas, inicia/finaliza, reporta GPS automático, lança abastecimento
- 🗺️ **Mapa em tempo real** — operador acompanha o motorista se movendo (GPS a cada 3min)
- 🔔 **Alertas inteligentes** — CNH vencendo, multa próxima do vencimento, manutenção devida, seguro expirando

---

# Stack técnica

Construído com tecnologias modernas e maduras:

| Camada | Tecnologia |
|---|---|
| **Backend** | NestJS 11 + Fastify 5 + Prisma 6 |
| **Web** | Next.js 15 (App Router) + Tailwind 4 + React 19 |
| **Mobile** | Expo 54 + React Native 0.81 + Gluestack UI v2 |
| **Banco** | PostgreSQL 17 (Supabase em produção) |
| **Mapas** | Mapbox Geocoding + Directions API |
| **Notificações** | Expo Push Notifications |
| **Tipos** | TypeScript strict em 100% do código |

---

# Arquitetura

3 apps + 4 packages compartilhados em monorepo Turbo:

```
Web (Vercel)  ──┐
                ├──► API (Railway) ──► Postgres (Supabase)
Mobile (EAS) ───┘         │
                          ├──► Mapbox (geocoding + rotas)
                          └──► Expo Push (notificações)
```

- **Web**: Server Components consumindo Server Actions
- **API**: REST + Swagger documentado em `/api`
- **Mobile**: standalone (fora do monorepo bun por compatibilidade nativa)

---

# Banco de dados

**22 tabelas** organizadas em 5 camadas:

- **9 lookups** — `perfis_usuario`, `status_viagem`, `tipos_combustivel`, etc. (categorização normalizada, nunca enum)
- **2 entidades principais** — `usuarios`, `veiculos`
- **2 entidades de viagem** — `viagens`, `posicoes_viagem` (GPS)
- **6 tabelas de despesa** — multas, abastecimentos, manutenções, impostos, seguros, documentações
- **1 auditoria** — `impostos_historicos` (trilha de alteração)

Padrões: snake_case, INT autoincrement, soft delete via `data_hora_exclusao`, fuso `America/Sao_Paulo` em tudo.

---

# Diagrama interativo do banco

Construído com **React Flow** dentro do próprio web:

🔗 [projeto-frota-web.vercel.app/erd](https://projeto-frota-web.vercel.app/erd)

- Rota pública, sem auth
- 22 tabelas com PK / FK / UK marcados
- Linhas conectam **coluna FK → coluna PK** (não caixa-a-caixa)
- Drag das tabelas, zoom infinito, MiniMap
- Atualiza junto com o schema (single source of truth)

---

# Fluxo de viagem — workflow

Estado controlado por máquina de estados (FK para `status_viagem`):

```
   CRIADA
     │  (operador cria viagem atribuindo motorista + veículo)
     ▼
EM_ANDAMENTO
     │  (motorista inicia no app, registra odômetro inicial)
     │  → GPS começa a reportar a cada 3min
     │  → operador acompanha no mapa
     ▼
FINALIZADA
     │  (motorista finaliza, registra odômetro final)
     └──► distância percorrida calculada
          odômetro do veículo atualizado
```

---

# Tela do operador (Web)

Funcionalidades disponíveis:

- **Dashboard** com KPIs (viagens hoje, em andamento, finalizadas, alertas)
- **CRUD completo**: motoristas, veículos, usuários, viagens
- **Despesas por veículo** — 1 tela com 6 tabs (multas, abastecimentos, manutenções, impostos, seguros, documentações)
- **Mapa Mapbox** com rota cacheada e marcador do motorista atualizando em tempo real
- **Relatórios** — distância por motorista, distância por veículo (com export CSV)
- **Alertas** — CNH vencendo, multas/seguros vencendo, manutenção devida
- **Configurações** — sede da empresa, etc.

---

# Tela do motorista (Mobile)

App nativo Android/iOS:

- **Login** com matrícula + senha
- **Lista de viagens** atribuídas (CRIADA, EM_ANDAMENTO, FINALIZADA)
- **Detalhe da viagem** com mapa interativo e info da rota (distância, duração estimada)
- **Iniciar viagem** → GPS começa a reportar
- **Finalizar viagem** → registra odômetro final
- **Lançar abastecimento** rápido (litros, preço/litro, total)
- **Notificações push** ao receber nova viagem

---

# Geolocalização & rotas

Integração completa com Mapbox:

- 🌎 **Geocoding** — converte endereço (texto) em lat/lng ao criar viagem
- 🛣️ **Directions API** — calcula rota real (não linha reta), cacheada como GeoJSON
- 📊 **Velocidade média** calibrada a partir de viagens FINALIZADAS por motorista (não chute genérico)
- 📍 **GPS no mobile** — a cada 3min durante `EM_ANDAMENTO`, salvo em `posicoes_viagem`
- 🗺️ **Mapa no web** — polling a cada 30s, marcador atualiza em quase-tempo-real

---

# Despesas — modelagem normalizada

Cada tipo de despesa tem schema próprio (não mais 1 tabela tabelão):

| Tabela | Campos específicos |
|---|---|
| `multas` | `numero_auto`, `pontos_cnh`, `data_vencimento` |
| `abastecimentos` | `litros`, `preco_litro`, `odometro` |
| `manutencoes` | `oficina`, `odometro`, `tipo_manutencao` |
| `impostos` | `ano_exercicio`, `parcelas`, `data_vencimento` |
| `seguros` | `seguradora`, `apolice`, `vigencia_inicio/fim` |
| `documentacoes` | `data_vencimento` |

`impostos_historicos` grava toda alteração em impostos (auditoria de parcelas/juros).

---

# Segurança & autenticação

- **JWT** com expiração de 7 dias
- **bcrypt** para hash de senhas (10 salt rounds)
- **Guards** por papel (admin, operador, gerente, encarregado, motorista)
- **CORS** restrito a domínios conhecidos
- **Rate limiting** via Throttler (60 req/min por IP, sobrescrito em `/auth/login`)
- **Helmet** ativo no Fastify
- **Soft delete** preserva auditoria histórica

---

# Qualidade & confiabilidade

Tudo automatizado, nada manual:

| Métrica | Status |
|---|---|
| **TypeScript strict** | ✅ Sem `any` em 100% do código |
| **Testes unitários** | ✅ 62/62 passando (8 services cobertos) |
| **Smoke E2E API** | ✅ Login + lookups + erros |
| **Lint** | ✅ ESLint 6/6 verde |
| **CI/CD** | ✅ GitHub Actions com cache + concurrency |
| **Auto-deploy** | ✅ Railway (API) + Vercel (web) em cada push pra `main` |

---

# Documentação interna

Para onboarding rápido de qualquer dev novo:

- **README.md** — visão geral + setup em 7 passos
- **CLAUDE.md** — convenções obrigatórias (PT-BR, snake_case, etc.)
- **PRD-FleetOps-MVP.md** — requisitos do produto
- **docs/ERD.md** — schema completo em Mermaid
- **DEPLOY_CHECKLIST.md** — procedimento de deploy passo-a-passo
- **Swagger** — API auto-documentada em `/api`
- **Rota `/erd`** — diagrama interativo do banco

---

# Convenções de código

Para garantir consistência long-term:

- **Idioma**: PT-BR em todo código de domínio (entidades, variáveis, mensagens)
- **Conventional Commits** em PT-BR (`feat:`, `fix:`, `refactor:`)
- **Sem `new Date()` direto** — sempre via `@fleetops/utils/datetime` (TZ America/Sao_Paulo)
- **Sem timestamps UTC** no banco
- **Server Components por padrão** no Next 15
- **React Hook Form + Zod** em todos os formulários

---

# Deploy & ambientes

Produção rodando agora:

- 🌐 **Web** — [projeto-frota-web.vercel.app](https://projeto-frota-web.vercel.app)
- 🔌 **API** — [projeto-frota-production.up.railway.app](https://projeto-frota-production.up.railway.app)
- 📱 **Mobile** — APK distribuído via EAS Build
- 💾 **Banco** — Supabase Postgres 17 (Session Pooler)

Credenciais de teste:
- Admin: `0000000001` / `Admin@123456`
- Motorista: `0000001234` / `12341234` (com 4 viagens em estados diferentes)

---

# Roadmap pós-MVP

Próximas evoluções planejadas:

- **Refresh tokens + 2FA** (descartado do MVP por escopo)
- **Despesas no mobile** — hoje só abastecimento, expandir para multas/manutenções
- **Relatórios em PDF** com gráficos
- **Geofencing** — alertas se o motorista sair da rota planejada
- **OpenAPI client gerado** — substituir fetch manual por client tipado
- **Integração com sistemas de RH** para sincronizar funcionários
- **Modo offline** no mobile para áreas sem cobertura

---

# Resumo executivo

**O que entregamos:**

- 3 apps (web, API, mobile) em produção
- 22 tabelas modeladas com auditoria e soft delete
- 62 testes unitários passando + CI/CD automatizado
- GPS real-time + mapas Mapbox + push notifications
- Documentação completa (README, ERD, Deploy checklist)
- Diagrama interativo do banco como rota pública

**Valor entregue:**

- Visibilidade total da operação em tempo real
- Eliminação de planilhas paralelas de despesa
- Alertas proativos antes dos problemas
- Auditoria completa de quem fez o quê e quando
- Base sólida pra escalar para mais clientes

---

# Obrigado

🔗 **Demo ao vivo:** [projeto-frota-web.vercel.app](https://projeto-frota-web.vercel.app)
📊 **Diagrama ER:** [projeto-frota-web.vercel.app/erd](https://projeto-frota-web.vercel.app/erd)
💻 **Repositório:** github.com/7noronha/projeto-frota
