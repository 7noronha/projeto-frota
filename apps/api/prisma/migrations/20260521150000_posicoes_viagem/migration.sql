-- Tabela de posições GPS em tempo real durante viagens EM_ANDAMENTO.
-- O app mobile do motorista envia 1 ponto a cada 3 minutos via POST
-- /viagens/:id/posicoes. O operador vê a posição via GET /viagens/:id
-- (campo extra ou rota dedicada).
--
-- ON DELETE CASCADE: se a viagem for excluída em hard delete, as
-- posições somem junto. Soft delete (dataExclusao) não afeta.

CREATE TABLE "posicoes_viagem" (
  "id"            TEXT         PRIMARY KEY,
  "viagem_id"     TEXT         NOT NULL,
  "latitude"      DECIMAL(10,7) NOT NULL,
  "longitude"     DECIMAL(10,7) NOT NULL,
  "precisao_m"    DECIMAL(8,2),
  "capturado_em"  TIMESTAMP(6) NOT NULL,
  "data_criacao"  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "fk_posicoes_viagem"
    FOREIGN KEY ("viagem_id") REFERENCES "viagens"("id")
    ON DELETE CASCADE
);

-- Query quente: "últimas N posições de uma viagem" — varre desc por tempo.
CREATE INDEX "idx_posicoes_viagem_tempo"
  ON "posicoes_viagem" ("viagem_id", "capturado_em" DESC);
