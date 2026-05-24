-- CreateTable
CREATE TABLE "perfis_usuario" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(40) NOT NULL,
    "descricao" VARCHAR(200),

    CONSTRAINT "perfis_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "situacoes_veiculo" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(40) NOT NULL,
    "descricao" VARCHAR(200),

    CONSTRAINT "situacoes_veiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_viagem" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(40) NOT NULL,
    "descricao" VARCHAR(200),

    CONSTRAINT "status_viagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_combustivel" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(40) NOT NULL,
    "descricao" VARCHAR(200),

    CONSTRAINT "tipos_combustivel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_manutencao" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(40) NOT NULL,
    "descricao" VARCHAR(200),

    CONSTRAINT "tipos_manutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gravidades_multa" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(40) NOT NULL,
    "descricao" VARCHAR(200),
    "pontos_padrao" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gravidades_multa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_imposto" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(40) NOT NULL,
    "descricao" VARCHAR(200),

    CONSTRAINT "tipos_imposto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_cobertura_seguro" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(40) NOT NULL,
    "descricao" VARCHAR(200),

    CONSTRAINT "tipos_cobertura_seguro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_documento_veiculo" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(40) NOT NULL,
    "descricao" VARCHAR(200),

    CONSTRAINT "tipos_documento_veiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "matricula" VARCHAR(10) NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "perfil_id" INTEGER NOT NULL,
    "email" VARCHAR(200),
    "telefone" VARCHAR(20),
    "cnh" VARCHAR(20),
    "cnh_validade" DATE,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_hora_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_hora_atualizacao" TIMESTAMP(6) NOT NULL,
    "data_hora_exclusao" TIMESTAMP(6),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos" (
    "id" SERIAL NOT NULL,
    "placa" VARCHAR(10) NOT NULL,
    "marca" VARCHAR(80) NOT NULL,
    "modelo" VARCHAR(100) NOT NULL,
    "ano_fabricacao" INTEGER NOT NULL,
    "ano_modelo" INTEGER NOT NULL,
    "cor" VARCHAR(50) NOT NULL,
    "renavam" VARCHAR(11) NOT NULL,
    "odometro_atual" INTEGER NOT NULL,
    "data_aquisicao" DATE NOT NULL,
    "situacao_id" INTEGER NOT NULL,
    "observacoes" TEXT,
    "data_hora_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_hora_atualizacao" TIMESTAMP(6) NOT NULL,
    "data_hora_exclusao" TIMESTAMP(6),

    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viagens" (
    "id" SERIAL NOT NULL,
    "origem" VARCHAR(500) NOT NULL,
    "destino" VARCHAR(500) NOT NULL,
    "origem_latitude" DECIMAL(10,7),
    "origem_longitude" DECIMAL(10,7),
    "destino_latitude" DECIMAL(10,7),
    "destino_longitude" DECIMAL(10,7),
    "rota_geometria" JSONB,
    "rota_distancia_km" DECIMAL(10,2),
    "rota_duracao_min" INTEGER,
    "data_viagem" DATE NOT NULL,
    "hora_inicio_prevista" TIME(0) NOT NULL,
    "hora_fim_prevista" TIME(0) NOT NULL,
    "data_hora_inicio_real" TIMESTAMP(6),
    "data_hora_fim_real" TIMESTAMP(6),
    "odometro_inicial" INTEGER,
    "odometro_final" INTEGER,
    "distancia_percorrida" INTEGER,
    "motorista_id" INTEGER NOT NULL,
    "veiculo_id" INTEGER NOT NULL,
    "operador_criador_id" INTEGER NOT NULL,
    "solicitado_por" VARCHAR(200) NOT NULL,
    "autorizado_por" VARCHAR(200) NOT NULL,
    "observacoes" TEXT,
    "status_id" INTEGER NOT NULL,
    "data_hora_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_hora_atualizacao" TIMESTAMP(6) NOT NULL,
    "data_hora_exclusao" TIMESTAMP(6),

    CONSTRAINT "viagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posicoes_viagem" (
    "id" SERIAL NOT NULL,
    "viagem_id" INTEGER NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "precisao_m" DECIMAL(8,2),
    "capturado_em" TIMESTAMP(6) NOT NULL,
    "data_hora_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posicoes_viagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multas" (
    "id" SERIAL NOT NULL,
    "veiculo_id" INTEGER NOT NULL,
    "gravidade_multa_id" INTEGER NOT NULL,
    "data" DATE NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" VARCHAR(500) NOT NULL,
    "numero_auto" VARCHAR(50),
    "pontos_cnh" INTEGER,
    "data_vencimento" DATE,
    "observacoes" TEXT,
    "data_hora_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_hora_atualizacao" TIMESTAMP(6) NOT NULL,
    "data_hora_exclusao" TIMESTAMP(6),

    CONSTRAINT "multas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abastecimentos" (
    "id" SERIAL NOT NULL,
    "veiculo_id" INTEGER NOT NULL,
    "tipo_combustivel_id" INTEGER NOT NULL,
    "data" DATE NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" VARCHAR(500) NOT NULL,
    "litros" DECIMAL(8,3) NOT NULL,
    "preco_litro" DECIMAL(8,3) NOT NULL,
    "odometro" INTEGER,
    "observacoes" TEXT,
    "data_hora_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_hora_atualizacao" TIMESTAMP(6) NOT NULL,
    "data_hora_exclusao" TIMESTAMP(6),

    CONSTRAINT "abastecimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manutencoes" (
    "id" SERIAL NOT NULL,
    "veiculo_id" INTEGER NOT NULL,
    "tipo_manutencao_id" INTEGER NOT NULL,
    "data" DATE NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" VARCHAR(500) NOT NULL,
    "oficina" VARCHAR(200),
    "odometro" INTEGER,
    "observacoes" TEXT,
    "data_hora_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_hora_atualizacao" TIMESTAMP(6) NOT NULL,
    "data_hora_exclusao" TIMESTAMP(6),

    CONSTRAINT "manutencoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impostos" (
    "id" SERIAL NOT NULL,
    "veiculo_id" INTEGER NOT NULL,
    "tipo_imposto_id" INTEGER NOT NULL,
    "data" DATE NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" VARCHAR(500) NOT NULL,
    "ano_exercicio" INTEGER NOT NULL,
    "numero_parcela" INTEGER,
    "total_parcelas" INTEGER,
    "data_vencimento" DATE,
    "observacoes" TEXT,
    "data_hora_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_hora_atualizacao" TIMESTAMP(6) NOT NULL,
    "data_hora_exclusao" TIMESTAMP(6),

    CONSTRAINT "impostos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impostos_historicos" (
    "id" SERIAL NOT NULL,
    "imposto_id" INTEGER NOT NULL,
    "campo" VARCHAR(40) NOT NULL,
    "valor_anterior" TEXT,
    "valor_novo" TEXT,
    "alterado_por" INTEGER,
    "data_hora_alteracao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "impostos_historicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguros" (
    "id" SERIAL NOT NULL,
    "veiculo_id" INTEGER NOT NULL,
    "tipo_cobertura_seguro_id" INTEGER NOT NULL,
    "data" DATE NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" VARCHAR(500) NOT NULL,
    "seguradora" VARCHAR(200) NOT NULL,
    "numero_apolice" VARCHAR(100),
    "vigencia_inicio" DATE NOT NULL,
    "vigencia_fim" DATE NOT NULL,
    "observacoes" TEXT,
    "data_hora_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_hora_atualizacao" TIMESTAMP(6) NOT NULL,
    "data_hora_exclusao" TIMESTAMP(6),

    CONSTRAINT "seguros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentacoes" (
    "id" SERIAL NOT NULL,
    "veiculo_id" INTEGER NOT NULL,
    "tipo_documento_veiculo_id" INTEGER NOT NULL,
    "data" DATE NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" VARCHAR(500) NOT NULL,
    "data_vencimento" DATE,
    "observacoes" TEXT,
    "data_hora_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_hora_atualizacao" TIMESTAMP(6) NOT NULL,
    "data_hora_exclusao" TIMESTAMP(6),

    CONSTRAINT "documentacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" SERIAL NOT NULL,
    "chave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "data_hora_atualizacao" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "perfis_usuario_nome_key" ON "perfis_usuario"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "situacoes_veiculo_nome_key" ON "situacoes_veiculo"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "status_viagem_nome_key" ON "status_viagem"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_combustivel_nome_key" ON "tipos_combustivel"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_manutencao_nome_key" ON "tipos_manutencao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "gravidades_multa_nome_key" ON "gravidades_multa"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_imposto_nome_key" ON "tipos_imposto"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_cobertura_seguro_nome_key" ON "tipos_cobertura_seguro"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_documento_veiculo_nome_key" ON "tipos_documento_veiculo"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_matricula_key" ON "usuarios"("matricula");

-- CreateIndex
CREATE INDEX "usuarios_perfil_id_idx" ON "usuarios"("perfil_id");

-- CreateIndex
CREATE INDEX "usuarios_cnh_validade_idx" ON "usuarios"("cnh_validade");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_renavam_key" ON "veiculos"("renavam");

-- CreateIndex
CREATE INDEX "veiculos_placa_idx" ON "veiculos"("placa");

-- CreateIndex
CREATE INDEX "veiculos_situacao_id_idx" ON "veiculos"("situacao_id");

-- CreateIndex
CREATE INDEX "viagens_motorista_id_status_id_idx" ON "viagens"("motorista_id", "status_id");

-- CreateIndex
CREATE INDEX "viagens_veiculo_id_status_id_idx" ON "viagens"("veiculo_id", "status_id");

-- CreateIndex
CREATE INDEX "viagens_data_viagem_idx" ON "viagens"("data_viagem");

-- CreateIndex
CREATE INDEX "viagens_status_id_data_viagem_idx" ON "viagens"("status_id", "data_viagem");

-- CreateIndex
CREATE INDEX "posicoes_viagem_viagem_id_capturado_em_idx" ON "posicoes_viagem"("viagem_id", "capturado_em" DESC);

-- CreateIndex
CREATE INDEX "multas_veiculo_id_data_idx" ON "multas"("veiculo_id", "data");

-- CreateIndex
CREATE INDEX "multas_data_vencimento_idx" ON "multas"("data_vencimento");

-- CreateIndex
CREATE INDEX "abastecimentos_veiculo_id_data_idx" ON "abastecimentos"("veiculo_id", "data");

-- CreateIndex
CREATE INDEX "manutencoes_veiculo_id_data_idx" ON "manutencoes"("veiculo_id", "data");

-- CreateIndex
CREATE INDEX "impostos_veiculo_id_data_idx" ON "impostos"("veiculo_id", "data");

-- CreateIndex
CREATE INDEX "impostos_data_vencimento_idx" ON "impostos"("data_vencimento");

-- CreateIndex
CREATE INDEX "impostos_ano_exercicio_idx" ON "impostos"("ano_exercicio");

-- CreateIndex
CREATE INDEX "impostos_historicos_imposto_id_data_hora_alteracao_idx" ON "impostos_historicos"("imposto_id", "data_hora_alteracao" DESC);

-- CreateIndex
CREATE INDEX "seguros_veiculo_id_vigencia_fim_idx" ON "seguros"("veiculo_id", "vigencia_fim");

-- CreateIndex
CREATE INDEX "documentacoes_veiculo_id_data_idx" ON "documentacoes"("veiculo_id", "data");

-- CreateIndex
CREATE INDEX "documentacoes_data_vencimento_idx" ON "documentacoes"("data_vencimento");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "configuracoes"("chave");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "perfis_usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_situacao_id_fkey" FOREIGN KEY ("situacao_id") REFERENCES "situacoes_veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_motorista_id_fkey" FOREIGN KEY ("motorista_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_operador_criador_id_fkey" FOREIGN KEY ("operador_criador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status_viagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posicoes_viagem" ADD CONSTRAINT "posicoes_viagem_viagem_id_fkey" FOREIGN KEY ("viagem_id") REFERENCES "viagens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multas" ADD CONSTRAINT "multas_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multas" ADD CONSTRAINT "multas_gravidade_multa_id_fkey" FOREIGN KEY ("gravidade_multa_id") REFERENCES "gravidades_multa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abastecimentos" ADD CONSTRAINT "abastecimentos_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abastecimentos" ADD CONSTRAINT "abastecimentos_tipo_combustivel_id_fkey" FOREIGN KEY ("tipo_combustivel_id") REFERENCES "tipos_combustivel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manutencoes" ADD CONSTRAINT "manutencoes_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manutencoes" ADD CONSTRAINT "manutencoes_tipo_manutencao_id_fkey" FOREIGN KEY ("tipo_manutencao_id") REFERENCES "tipos_manutencao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impostos" ADD CONSTRAINT "impostos_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impostos" ADD CONSTRAINT "impostos_tipo_imposto_id_fkey" FOREIGN KEY ("tipo_imposto_id") REFERENCES "tipos_imposto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impostos_historicos" ADD CONSTRAINT "impostos_historicos_imposto_id_fkey" FOREIGN KEY ("imposto_id") REFERENCES "impostos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguros" ADD CONSTRAINT "seguros_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguros" ADD CONSTRAINT "seguros_tipo_cobertura_seguro_id_fkey" FOREIGN KEY ("tipo_cobertura_seguro_id") REFERENCES "tipos_cobertura_seguro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentacoes" ADD CONSTRAINT "documentacoes_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentacoes" ADD CONSTRAINT "documentacoes_tipo_documento_veiculo_id_fkey" FOREIGN KEY ("tipo_documento_veiculo_id") REFERENCES "tipos_documento_veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
