CREATE TYPE "TipoCuidado" AS ENUM ('VACINA', 'VERMIFUGO', 'BANHO_E_TOSA', 'CONSULTA', 'REMEDIO');
CREATE TYPE "Recorrencia" AS ENUM ('NENHUMA', 'SEMANAL', 'MENSAL', 'ANUAL', 'PERSONALIZADA');
CREATE TYPE "StatusEvento" AS ENUM ('PENDENTE', 'CONCLUIDO', 'CANCELADO');

CREATE TABLE "evento" (
  "id" UUID NOT NULL,
  "pet_id" UUID NOT NULL,
  "tipo_cuidado" "TipoCuidado" NOT NULL,
  "data_hora" TIMESTAMP(3) NOT NULL,
  "recorrencia" "Recorrencia" NOT NULL DEFAULT 'NENHUMA',
  "status" "StatusEvento" NOT NULL DEFAULT 'PENDENTE',
  "descricao" VARCHAR(255),
  "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "evento_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "evento_pet_id_idx" ON "evento"("pet_id");
CREATE INDEX "evento_data_hora_idx" ON "evento"("data_hora");

ALTER TABLE "evento" ADD CONSTRAINT "evento_pet_id_fkey"
  FOREIGN KEY ("pet_id") REFERENCES "pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
