-- AlterTable
ALTER TABLE "tutor"
ADD COLUMN "telefone" VARCHAR(25),
ADD COLUMN "bio" VARCHAR(500),
ADD COLUMN "timezone" VARCHAR(50) DEFAULT 'America/Sao_Paulo',
ADD COLUMN "avatar_url" VARCHAR(255),
ADD COLUMN "avatar_thumb_128" VARCHAR(255),
ADD COLUMN "avatar_thumb_256" VARCHAR(255);
