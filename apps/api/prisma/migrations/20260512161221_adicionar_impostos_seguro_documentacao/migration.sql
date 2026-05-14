-- AlterTable
ALTER TABLE "despesas_veiculos" ADD COLUMN     "ano_exercicio" INTEGER,
ADD COLUMN     "cobertura_tipo" VARCHAR(30),
ADD COLUMN     "numero_apolice" VARCHAR(100),
ADD COLUMN     "numero_parcela" INTEGER,
ADD COLUMN     "seguradora" VARCHAR(200),
ADD COLUMN     "tipo_documento" VARCHAR(30),
ADD COLUMN     "tipo_imposto" VARCHAR(30),
ADD COLUMN     "total_parcelas" INTEGER,
ADD COLUMN     "vigencia_fim" DATE,
ADD COLUMN     "vigencia_inicio" DATE;

-- CreateIndex
CREATE INDEX "idx_despesas_vigencia_fim" ON "despesas_veiculos"("vigencia_fim");

-- CreateIndex
CREATE INDEX "idx_despesas_data_vencimento" ON "despesas_veiculos"("data_vencimento");
