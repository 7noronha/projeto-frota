-- CreateTable
CREATE TABLE "despesas_veiculos" (
    "id" TEXT NOT NULL,
    "veiculo_id" TEXT NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "data" DATE NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" VARCHAR(500) NOT NULL,
    "observacoes" TEXT,
    "odometro" INTEGER,
    "litros" DECIMAL(8,3),
    "preco_litro" DECIMAL(8,3),
    "tipo_combustivel" VARCHAR(20),
    "tipo_manutencao" VARCHAR(20),
    "oficina" VARCHAR(200),
    "numero_auto" VARCHAR(50),
    "gravidade" VARCHAR(20),
    "pontos_cnh" INTEGER,
    "data_vencimento" DATE,
    "data_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(6) NOT NULL,
    "data_exclusao" TIMESTAMP(6),

    CONSTRAINT "despesas_veiculos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_despesas_veiculo_tipo" ON "despesas_veiculos"("veiculo_id", "tipo");

-- CreateIndex
CREATE INDEX "idx_despesas_data" ON "despesas_veiculos"("data");

-- AddForeignKey
ALTER TABLE "despesas_veiculos" ADD CONSTRAINT "despesas_veiculos_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
