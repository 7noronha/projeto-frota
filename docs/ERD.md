# FleetOps — Diagrama Entidade-Relacionamento

> Schema atual: **snake_case + INT autoincrement IDs + FKs para tabelas de lookup + soft delete via flag**. 22 tabelas PostgreSQL em `America/Sao_Paulo`.
>
> Fonte canônica: [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma)

---

## Visão geral

```mermaid
erDiagram
    %% ─── Lookups ───
    perfis_usuario           ||--o{ usuarios                : perfil_id
    situacoes_veiculo        ||--o{ veiculos               : situacao_id
    status_viagem            ||--o{ viagens                : status_id
    tipos_combustivel        ||--o{ abastecimentos         : tipo_combustivel_id
    tipos_manutencao         ||--o{ manutencoes            : tipo_manutencao_id
    gravidades_multa         ||--o{ multas                 : gravidade_multa_id
    tipos_imposto            ||--o{ impostos               : tipo_imposto_id
    tipos_cobertura_seguro   ||--o{ seguros                : tipo_cobertura_seguro_id
    tipos_documento_veiculo  ||--o{ documentacoes          : tipo_documento_veiculo_id

    %% ─── Entidades principais ───
    usuarios   ||--o{ viagens          : motorista_id
    usuarios   ||--o{ viagens          : operador_criador_id
    veiculos   ||--o{ viagens          : veiculo_id
    viagens    ||--o{ posicoes_viagem  : viagem_id

    %% ─── Despesas (6 subtipos) ───
    veiculos   ||--o{ multas          : veiculo_id
    veiculos   ||--o{ abastecimentos  : veiculo_id
    veiculos   ||--o{ manutencoes     : veiculo_id
    veiculos   ||--o{ impostos        : veiculo_id
    veiculos   ||--o{ seguros         : veiculo_id
    veiculos   ||--o{ documentacoes   : veiculo_id

    %% ─── Auditoria ───
    impostos   ||--o{ impostos_historicos : imposto_id

    perfis_usuario {
        int id PK
        string nome UK
        string descricao
    }

    situacoes_veiculo {
        int id PK
        string nome UK
        string descricao
    }

    status_viagem {
        int id PK
        string nome UK
        string descricao
    }

    tipos_combustivel {
        int id PK
        string nome UK
        string descricao
    }

    tipos_manutencao {
        int id PK
        string nome UK
        string descricao
    }

    gravidades_multa {
        int id PK
        string nome UK
        string descricao
        int pontos_padrao
    }

    tipos_imposto {
        int id PK
        string nome UK
        string descricao
    }

    tipos_cobertura_seguro {
        int id PK
        string nome UK
        string descricao
    }

    tipos_documento_veiculo {
        int id PK
        string nome UK
        string descricao
    }

    usuarios {
        int id PK
        string matricula UK
        string nome
        string senha_hash
        int perfil_id FK
        string email
        string telefone
        string cnh
        date cnh_validade
        bool ativo
        string expo_push_token
        timestamp data_hora_criacao
        timestamp data_hora_atualizacao
        timestamp data_hora_exclusao
    }

    veiculos {
        int id PK
        string placa UK
        string marca
        string modelo
        int ano_fabricacao
        int ano_modelo
        string cor
        string renavam UK
        int odometro_atual
        date data_aquisicao
        int situacao_id FK
        string observacoes
        timestamp data_hora_criacao
        timestamp data_hora_atualizacao
        timestamp data_hora_exclusao
    }

    viagens {
        int id PK
        string origem
        string destino
        decimal origem_latitude
        decimal origem_longitude
        decimal destino_latitude
        decimal destino_longitude
        jsonb rota_geometria
        decimal rota_distancia_km
        int rota_duracao_min
        date data_viagem
        time hora_inicio_prevista
        time hora_fim_prevista
        timestamp data_hora_inicio_real
        timestamp data_hora_fim_real
        int odometro_inicial
        int odometro_final
        int distancia_percorrida
        int motorista_id FK
        int veiculo_id FK
        int operador_criador_id FK
        string solicitado_por
        string autorizado_por
        string observacoes
        int status_id FK
        timestamp data_hora_criacao
        timestamp data_hora_atualizacao
        timestamp data_hora_exclusao
    }

    posicoes_viagem {
        int id PK
        int viagem_id FK
        decimal latitude
        decimal longitude
        decimal precisao_m
        timestamp capturado_em
        timestamp data_hora_criacao
    }

    multas {
        int id PK
        int veiculo_id FK
        int gravidade_multa_id FK
        date data
        decimal valor
        string descricao
        string numero_auto
        int pontos_cnh
        date data_vencimento
        string observacoes
        timestamp data_hora_criacao
        timestamp data_hora_atualizacao
        timestamp data_hora_exclusao
    }

    abastecimentos {
        int id PK
        int veiculo_id FK
        int tipo_combustivel_id FK
        date data
        decimal valor
        string descricao
        decimal litros
        decimal preco_litro
        int odometro
        string observacoes
        timestamp data_hora_criacao
        timestamp data_hora_atualizacao
        timestamp data_hora_exclusao
    }

    manutencoes {
        int id PK
        int veiculo_id FK
        int tipo_manutencao_id FK
        date data
        decimal valor
        string descricao
        string oficina
        int odometro
        string observacoes
        timestamp data_hora_criacao
        timestamp data_hora_atualizacao
        timestamp data_hora_exclusao
    }

    impostos {
        int id PK
        int veiculo_id FK
        int tipo_imposto_id FK
        date data
        decimal valor
        string descricao
        int ano_exercicio
        int numero_parcela
        int total_parcelas
        date data_vencimento
        string observacoes
        timestamp data_hora_criacao
        timestamp data_hora_atualizacao
        timestamp data_hora_exclusao
    }

    impostos_historicos {
        int id PK
        int imposto_id FK
        string campo
        string valor_anterior
        string valor_novo
        int alterado_por
        timestamp data_hora_alteracao
    }

    seguros {
        int id PK
        int veiculo_id FK
        int tipo_cobertura_seguro_id FK
        date data
        decimal valor
        string descricao
        string seguradora
        string numero_apolice
        date vigencia_inicio
        date vigencia_fim
        string observacoes
        timestamp data_hora_criacao
        timestamp data_hora_atualizacao
        timestamp data_hora_exclusao
    }

    documentacoes {
        int id PK
        int veiculo_id FK
        int tipo_documento_veiculo_id FK
        date data
        decimal valor
        string descricao
        date data_vencimento
        string observacoes
        timestamp data_hora_criacao
        timestamp data_hora_atualizacao
        timestamp data_hora_exclusao
    }

    configuracoes {
        int id PK
        string chave UK
        string valor
        timestamp data_hora_atualizacao
    }
```

---

## Tabelas por categoria

### 1. Tabelas de lookup (9)

Toda categorização ("tipo de X", "status de X", "situação de X", "perfil de X") fica em tabela auxiliar separada — nunca enum no banco. Mesma forma (`id`, `nome` único, `descricao` opcional), uma exceção em `gravidades_multa` que tem `pontos_padrao` adicional.

| Tabela | Usada por | Valores típicos (seed) |
|---|---|---|
| `perfis_usuario` | `usuarios.perfil_id` | `admin`, `gerente`, `encarregado`, `operador`, `motorista` |
| `situacoes_veiculo` | `veiculos.situacao_id` | `ativo`, `em_manutencao`, `inativo`, `baixado` |
| `status_viagem` | `viagens.status_id` | `CRIADA`, `EM_ANDAMENTO`, `FINALIZADA` |
| `tipos_combustivel` | `abastecimentos.tipo_combustivel_id` | `gasolina`, `etanol`, `diesel`, `gnv`, `flex` |
| `tipos_manutencao` | `manutencoes.tipo_manutencao_id` | `preventiva`, `corretiva`, `troca_oleo`, `pneus`, `eletrica`, `funilaria` |
| `gravidades_multa` | `multas.gravidade_multa_id` | `leve` (3 pts), `media` (4 pts), `grave` (5 pts), `gravissima` (7 pts) |
| `tipos_imposto` | `impostos.tipo_imposto_id` | `IPVA`, `DPVAT`, `licenciamento`, `outros` |
| `tipos_cobertura_seguro` | `seguros.tipo_cobertura_seguro_id` | `total`, `terceiros`, `compreensiva` |
| `tipos_documento_veiculo` | `documentacoes.tipo_documento_veiculo_id` | `CRLV`, `CRV`, `vistoria`, `licenciamento`, `outros` |

**Por quê?** Permite editar nomes sem migration, traduções futuras, queries por nome em joins, e sumiço de tipos sem perder histórico (`onDelete: Restrict` implícito).

---

### 2. Entidades principais (2)

#### `usuarios`
- Tanto operadores quanto motoristas — distinção via `perfil_id`
- `matricula` única (10 dígitos, ex: `0000000001`)
- `senha_hash` em bcrypt (10 salt rounds)
- `cnh` + `cnh_validade` obrigatórios quando `perfil.nome === 'motorista'`
- `expo_push_token` registrado pelo app mobile no login

#### `veiculos`
- `placa` única (formato Mercosul ou antigo)
- `renavam` único (11 dígitos)
- `odometro_atual` atualizado ao finalizar viagens
- Sem motorista vinculado direto — relacionamento via `viagens.motorista_id`

---

### 3. Viagens e rastreamento (2)

#### `viagens`
- Estado controlado por `status_id` (FK para `status_viagem`)
- Fluxo: `CRIADA` → `EM_ANDAMENTO` (motorista inicia, registra `odometro_inicial` + `data_hora_inicio_real`) → `FINALIZADA` (motorista finaliza, registra `odometro_final` + calcula `distancia_percorrida`)
- Origem e destino geocodificados via Mapbox no `create` (lat/lng + rota cacheada em `rota_geometria` JsonB)
- `motorista_id` e `operador_criador_id` referenciam `usuarios` com relations nomeadas (ambiguidade resolvida no Prisma com `@relation("MotoristaViagens")` / `@relation("OperadorCriadorViagens")`)

#### `posicoes_viagem`
- App mobile envia GPS a cada 3 min enquanto a viagem está `EM_ANDAMENTO`
- `onDelete: Cascade` — apagar a viagem apaga todas as posições
- Operador no web polla a cada 30s para ver o motorista se mover em quase-tempo-real

---

### 4. Despesas (6 subtipos)

Todas têm a mesma "base" semântica:
```
id, veiculo_id, data, valor, descricao, observacoes,
data_hora_criacao, data_hora_atualizacao, data_hora_exclusao
```

E acrescentam campos específicos:

| Subtipo | FK lookup | Campos extras |
|---|---|---|
| `multas` | `gravidade_multa_id` | `numero_auto`, `pontos_cnh`, `data_vencimento` |
| `abastecimentos` | `tipo_combustivel_id` | `litros`, `preco_litro`, `odometro` |
| `manutencoes` | `tipo_manutencao_id` | `oficina`, `odometro` |
| `impostos` | `tipo_imposto_id` | `ano_exercicio`, `numero_parcela`, `total_parcelas`, `data_vencimento` |
| `seguros` | `tipo_cobertura_seguro_id` | `seguradora`, `numero_apolice`, `vigencia_inicio`, `vigencia_fim` |
| `documentacoes` | `tipo_documento_veiculo_id` | `data_vencimento` |

**Por que separar?** Despesas tinham forma muito divergente em uma tabela única (campos NULL para a maioria dos casos, validações condicionais). Separadas, cada tabela tem schema rígido + queries de relatório ficam triviais.

---

### 5. Auditoria (1)

#### `impostos_historicos`
- Toda alteração em `impostos` gera uma linha aqui via transação do service
- `valor_anterior` e `valor_novo` em texto (qualquer tipo serializado)
- `alterado_por` → `usuarios.id` (não FK formal porque pode ser `null` em casos legados)
- `onDelete: Cascade` — descartar imposto descarta histórico
- Endpoint: `GET /impostos/:id/historicos`

Outras tabelas (`multas`, `seguros`, etc.) **não** têm histórico — só `impostos` por terem maior valor financeiro e ajustes mais frequentes (parcelas, juros).

---

### 6. Configurações (1)

#### `configuracoes`
- Chave/valor simples (`chave` único, `valor` text)
- Chaves atuais: `endereco_sede`, `latitude_sede`, `longitude_sede`

---

## Relacionamentos críticos

### 1:N — Veículo → Despesas (6 tabelas)

```
veiculos.id ◄── multas.veiculo_id
            ◄── abastecimentos.veiculo_id
            ◄── manutencoes.veiculo_id
            ◄── impostos.veiculo_id
            ◄── seguros.veiculo_id
            ◄── documentacoes.veiculo_id
```

A tela `/veiculos/[id]/despesas` no web faz 6 queries em paralelo (`Promise.all`) e renderiza em tabs.

### 1:N — Usuário → Viagens (2 relações)

```
usuarios.id ◄── viagens.motorista_id           (relation "MotoristaViagens")
            ◄── viagens.operador_criador_id    (relation "OperadorCriadorViagens")
```

Mesmo usuário pode aparecer nos dois lados (raro mas válido: operador que também é motorista).

### 1:N — Viagem → Posições GPS

```
viagens.id ◄── posicoes_viagem.viagem_id   (Cascade delete)
```

Índice em `[viagem_id, capturado_em desc]` para query rápida da última posição.

### 1:N — Lookups → Entidades

Padrão repetido em 9 lookups. Exemplo:

```
status_viagem.id ◄── viagens.status_id
                     queries usam id internamente, mas a UI sempre exibe .nome
```

O service mantém um cache de `nome → id` em memória (`Map<string, number>`) para evitar joins em todo lookup ("status_viagem onde nome = 'CRIADA'" vira lookup direto após primeira chamada).

---

## Padrões transversais

### Soft delete

Toda tabela mutável (entidades + despesas) tem `data_hora_exclusao TIMESTAMP NULL`. Queries de listagem filtram `data_hora_exclusao IS NULL`. **Lookups não têm soft delete** — são imutáveis.

### Timestamps

- `data_hora_criacao` — `@default(now())`
- `data_hora_atualizacao` — `@updatedAt`
- `data_hora_exclusao` — preenchido apenas no soft delete

Todos `TIMESTAMP WITHOUT TIME ZONE`, com banco em `TZ=America/Sao_Paulo`. **Nunca UTC**.

### Índices

| Tabela | Índice | Por quê |
|---|---|---|
| `usuarios` | `perfil_id`, `cnh_validade` | Filtro por perfil; alerta CNH vencendo |
| `veiculos` | `placa`, `situacao_id` | Lookup por placa; lista por situação |
| `viagens` | `motorista_id+status_id`, `veiculo_id+status_id`, `data_viagem`, `status_id+data_viagem` | Viagens ativas por motorista/veículo; relatórios por período |
| `posicoes_viagem` | `viagem_id, capturado_em desc` | Última posição de viagem ativa |
| `multas` | `veiculo_id+data`, `data_vencimento` | Lista por veículo; alerta vencimento |
| `seguros` | `veiculo_id+vigencia_fim` | Alerta seguro vencendo |
| `impostos` | `veiculo_id+data`, `data_vencimento`, `ano_exercicio` | Filtros principais |
| `documentacoes` | `veiculo_id+data`, `data_vencimento` | Idem |
| `impostos_historicos` | `imposto_id, data_hora_alteracao desc` | Lista cronológica do mais recente |

---

## Migrations

Histórico em `apps/api/prisma/migrations/`:

```
20260523004059_schema_snake_case_int_ids/    ← migration consolidada do refactor
20260523005225_add_expo_push_token_usuarios/ ← coluna expo_push_token
```

Migrations antigas (UUID era) arquivadas em `apps/api/prisma/migrations.OLD-uuid-snapshot/` para referência.

---

## Cardinalidades resumidas

| Origem | Tipo | Destino |
|---|---|---|
| `perfis_usuario` | 1:N | `usuarios` |
| `situacoes_veiculo` | 1:N | `veiculos` |
| `status_viagem` | 1:N | `viagens` |
| `tipos_combustivel` | 1:N | `abastecimentos` |
| `tipos_manutencao` | 1:N | `manutencoes` |
| `gravidades_multa` | 1:N | `multas` |
| `tipos_imposto` | 1:N | `impostos` |
| `tipos_cobertura_seguro` | 1:N | `seguros` |
| `tipos_documento_veiculo` | 1:N | `documentacoes` |
| `usuarios` (motorista) | 1:N | `viagens` |
| `usuarios` (operador) | 1:N | `viagens` |
| `veiculos` | 1:N | `viagens` |
| `veiculos` | 1:N | (6 despesas) |
| `viagens` | 1:N | `posicoes_viagem` (Cascade) |
| `impostos` | 1:N | `impostos_historicos` (Cascade) |

Total: **22 tabelas, ~30 relacionamentos**.

---

## Como visualizar o diagrama

O Mermaid acima renderiza automaticamente no GitHub. Para visualização local:

```bash
# Opção 1: instale a extensão "Markdown Preview Mermaid Support" no VS Code
# Opção 2: use o Prisma Studio (mais visual, mas só mostra dados)
cd apps/api && bunx prisma studio
```

Para exportar como SVG/PNG do diagrama:

```bash
# Usando mermaid-cli
npx -p @mermaid-js/mermaid-cli mmdc -i docs/ERD.md -o docs/erd.svg
```
