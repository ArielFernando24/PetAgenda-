import { z } from "zod";

const clinicaFields = {
  nome: z.string().trim().min(2, "O nome deve ter no minimo 2 caracteres.").max(120),
  telefone: z
    .string()
    .trim()
    .min(8, "O telefone deve ter no minimo 8 caracteres.")
    .max(25, "O telefone deve ter no maximo 25 caracteres."),
  email: z.string().trim().email("Informe um e-mail valido.").max(150).nullable().optional(),
  endereco: z.string().trim().min(3, "O endereco deve ter no minimo 3 caracteres.").max(255),
  cidade: z.string().trim().min(2, "A cidade deve ter no minimo 2 caracteres.").max(100),
  estado: z
    .string()
    .trim()
    .length(2, "O estado deve conter 2 letras (sigla UF).")
    .toUpperCase(),
  horarioFuncionamento: z.string().trim().max(150).nullable().optional(),
  servicos: z.array(z.string().trim().min(1)).optional().default([]),
  descricao: z.string().trim().max(500).nullable().optional(),
};

export const createClinicaSchema = z.object(clinicaFields);

export const updateClinicaSchema = z
  .object(clinicaFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Informe ao menos um campo para atualizar.");

export const clinicaIdParamSchema = z.object({
  id: z.string().uuid("O ID da clinica deve ser um UUID valido."),
});

export const listClinicasQuerySchema = z.object({
  busca: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  estado: z.string().trim().length(2).toUpperCase().optional(),
  servico: z.string().trim().optional(),
});

function normalizeStatus(val: string): string {
  return val
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export const listAtendimentosQuerySchema = z.object({
  status: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? normalizeStatus(val) : undefined)),
  dataInicio: z.string().trim().optional(),
  dataFim: z.string().trim().optional(),
});

export const updateAtendimentoSchema = z
  .object({
    status: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val ? normalizeStatus(val) : undefined)),
    descricao: z.string().trim().max(500).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Informe ao menos um campo para atualizar.");

export const atendimentoParamSchema = z.object({
  id: z.string().uuid("O ID da clinica deve ser um UUID valido."),
  eventoId: z.string().uuid("O ID do atendimento deve ser um UUID valido."),
});

