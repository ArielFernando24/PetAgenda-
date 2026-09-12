-- AlterTable
ALTER TABLE "evento" ADD COLUMN     "clinica_id" UUID;

-- CreateTable
CREATE TABLE "clinica" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "telefone" VARCHAR(25) NOT NULL,
    "email" VARCHAR(150),
    "endereco" VARCHAR(255) NOT NULL,
    "cidade" VARCHAR(100) NOT NULL,
    "estado" VARCHAR(2) NOT NULL,
    "horario_funcionamento" VARCHAR(150),
    "servicos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "descricao" VARCHAR(500),
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clinica_cidade_idx" ON "clinica"("cidade");

-- CreateIndex
CREATE INDEX "clinica_nome_idx" ON "clinica"("nome");

-- CreateIndex
CREATE INDEX "evento_clinica_id_idx" ON "evento"("clinica_id");

-- AddForeignKey
ALTER TABLE "evento" ADD CONSTRAINT "evento_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinica"("id") ON DELETE SET NULL ON UPDATE CASCADE;
