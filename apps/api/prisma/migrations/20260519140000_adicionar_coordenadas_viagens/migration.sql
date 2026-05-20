-- Fase 1 do GPS: coordenadas opcionais de origem e destino da viagem.
ALTER TABLE "viagens"
  ADD COLUMN "origem_latitude"    DECIMAL(10,7),
  ADD COLUMN "origem_longitude"   DECIMAL(10,7),
  ADD COLUMN "destino_latitude"   DECIMAL(10,7),
  ADD COLUMN "destino_longitude"  DECIMAL(10,7);
