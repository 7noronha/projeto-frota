-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "matricula" VARCHAR(10) NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "perfil" VARCHAR(20) NOT NULL,
    "email" VARCHAR(200),
    "telefone" VARCHAR(20),
    "cnh" VARCHAR(20),
    "cnh_validade" DATE,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(6) NOT NULL,
    "data_exclusao" TIMESTAMP(6),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos" (
    "id" TEXT NOT NULL,
    "placa" VARCHAR(10) NOT NULL,
    "marca" VARCHAR(80) NOT NULL,
    "modelo" VARCHAR(100) NOT NULL,
    "ano_fabricacao" INTEGER NOT NULL,
    "ano_modelo" INTEGER NOT NULL,
    "cor" VARCHAR(50) NOT NULL,
    "renavam" VARCHAR(11) NOT NULL,
    "odometro_atual" INTEGER NOT NULL,
    "data_aquisicao" DATE NOT NULL,
    "situacao" VARCHAR(20) NOT NULL,
    "observacoes" TEXT,
    "data_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(6) NOT NULL,
    "data_exclusao" TIMESTAMP(6),

    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viagens" (
    "id" TEXT NOT NULL,
    "origem" VARCHAR(500) NOT NULL,
    "destino" VARCHAR(500) NOT NULL,
    "data_viagem" DATE NOT NULL,
    "hora_inicio_prevista" TIME(0) NOT NULL,
    "hora_fim_prevista" TIME(0) NOT NULL,
    "data_hora_inicio_real" TIMESTAMP(6),
    "data_hora_fim_real" TIMESTAMP(6),
    "odometro_inicial" INTEGER,
    "odometro_final" INTEGER,
    "distancia_percorrida" INTEGER,
    "motorista_id" TEXT NOT NULL,
    "veiculo_id" TEXT NOT NULL,
    "operador_criador_id" TEXT NOT NULL,
    "solicitado_por" VARCHAR(200) NOT NULL,
    "autorizado_por" VARCHAR(200) NOT NULL,
    "observacoes" TEXT,
    "status" VARCHAR(20) NOT NULL,
    "data_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(6) NOT NULL,
    "data_exclusao" TIMESTAMP(6),

    CONSTRAINT "viagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL,
    "chave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "data_atualizacao" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_matricula_key" ON "usuarios"("matricula");

-- CreateIndex
CREATE INDEX "idx_usuarios_perfil" ON "usuarios"("perfil");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_renavam_key" ON "veiculos"("renavam");

-- CreateIndex
CREATE INDEX "idx_veiculos_placa" ON "veiculos"("placa");

-- CreateIndex
CREATE INDEX "idx_viagens_motorista_status" ON "viagens"("motorista_id", "status");

-- CreateIndex
CREATE INDEX "idx_viagens_veiculo_status" ON "viagens"("veiculo_id", "status");

-- CreateIndex
CREATE INDEX "idx_viagens_data" ON "viagens"("data_viagem");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "configuracoes"("chave");

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_motorista_id_fkey" FOREIGN KEY ("motorista_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_operador_criador_id_fkey" FOREIGN KEY ("operador_criador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
