-- Performance: índices para queries quentes (alertas + listagens).
-- Aplicar com CONCURRENTLY em produção não é suportado por prisma migrate
-- (precisa de transação). Em prod ativa, aplicar manualmente via psql se
-- preferir não bloquear escrita.

-- Alerta de CNH vencida/vencendo: filtra Usuario por perfil + ativo +
-- cnhValidade <= limite. Hoje só temos idx_usuarios_perfil; sortear por
-- cnhValidade força full scan em motoristas.
CREATE INDEX "idx_usuarios_cnh_validade" ON "usuarios" ("cnh_validade");

-- Alertas de viagem percorrem WHERE status IN (...) AND dataExclusao IS NULL.
-- Os índices atuais sempre exigem motoristaId/veiculoId — não cobrem essas
-- queries varridas.
CREATE INDEX "idx_viagens_status_data" ON "viagens" ("status", "data_viagem");

-- Manutenção preventiva: lookup batch por veiculoId+tipo+tipoManutencao
-- ordenado por data desc. Acelera o for-loop de alertas (já refatorado pra
-- 1 query batch em vez de N).
CREATE INDEX "idx_despesas_tipo_manutencao_data" ON "despesas_veiculos" ("tipo", "tipo_manutencao", "data");

-- Filtros genéricos por tipo + data (listagens/relatórios).
CREATE INDEX "idx_despesas_tipo_data" ON "despesas_veiculos" ("tipo", "data");
