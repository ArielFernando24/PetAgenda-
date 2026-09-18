CREATE TYPE "PetSex" AS ENUM ('MACHO', 'FEMEA', 'NAO_INFORMADO');

CREATE TABLE "pet" (
  "id" UUID NOT NULL,
  "tutor_id" UUID NOT NULL,
  "nome" VARCHAR(80) NOT NULL,
  "especie" VARCHAR(50) NOT NULL,
  "raca" VARCHAR(80),
  "sexo" "PetSex" NOT NULL DEFAULT 'NAO_INFORMADO',
  "data_nascimento" DATE NOT NULL,
  "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pet_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "pet_tutor_id_idx" ON "pet"("tutor_id");
ALTER TABLE "pet" ADD CONSTRAINT "pet_tutor_id_fkey"
  FOREIGN KEY ("tutor_id") REFERENCES "tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
