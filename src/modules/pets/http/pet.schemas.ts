import { z } from "zod";
import { PET_SEX_VALUES } from "../domain/pet";

const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, "Informe uma data existente.")
  .refine(
    (value) => new Date(`${value}T00:00:00.000Z`) <= new Date(),
    "A data de nascimento nao pode estar no futuro.",
  );

const petFields = {
  nome: z.string().trim().min(1).max(80),
  especie: z.string().trim().min(1).max(50),
  raca: z.string().trim().min(1).max(80).nullable(),
  sexo: z.enum(PET_SEX_VALUES),
  dataNascimento: dateOfBirthSchema,
};

export const createPetSchema = z.object({
  ...petFields,
  raca: petFields.raca.optional().default(null),
  sexo: petFields.sexo.default("NAO_INFORMADO"),
});

export const updatePetSchema = z
  .object(petFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Informe ao menos um campo para atualizar.");

export const petIdParamSchema = z.object({
  id: z.string().uuid(),
});
