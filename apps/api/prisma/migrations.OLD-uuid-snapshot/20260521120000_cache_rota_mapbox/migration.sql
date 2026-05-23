-- Cache da rota Mapbox Directions (geometria + distância real + duração).
-- Populado ao criar a viagem; backfill preguiçoso em buscarPorId pra
-- viagens existentes.
ALTER TABLE "viagens"
  ADD COLUMN "rota_geometria"    JSONB,
  ADD COLUMN "rota_distancia_km" DECIMAL(10, 2),
  ADD COLUMN "rota_duracao_min"  INTEGER;
