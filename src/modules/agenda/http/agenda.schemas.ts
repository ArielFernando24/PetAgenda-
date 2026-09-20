import { z } from "zod";
import type { Recorrencia, StatusEvento, TipoCuidado } from "../domain/evento";

function normalizeString(val: string): string {
  return val
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

const TIPO_CUIDADO_MAP: Record<string, TipoCuidado> = {
  VACINA: "VACINA",
  VERMIFUGO: "VERMIFUGO",
  "BANHO & TOSA": "BANHO_E_TOSA",
  "BANHO E TOSA": "BANHO_E_TOSA",
  BANHO_E_TOSA: "BANHO_E_TOSA",
  BANHO_TOSA: "BANHO_E_TOSA",
  "BANHO/TOSA": "BANHO_E_TOSA",
  CONSULTA: "CONSULTA",
  REMEDIO: "REMEDIO",
  MEDICACAO: "REMEDIO",
};

export const tipoCuidadoSchema = z.string().transform((val, ctx) => {
  const key = normalizeString(val);
  const mapped = TIPO_CUIDADO_MAP[key];
  if (!mapped) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Tipo de cuidado invalido. Os tipos permitidos sao: Vacina, Vermifugo, Banho & Tosa, Consulta, Remedio.",
    });
    return z.NEVER;
  }
  return mapped;
});

const RECORRENCIA_MAP: Record<string, Recorrencia> = {
  NENHUMA: "NENHUMA",
  NAO_REPETE: "NENHUMA",
  UNICA: "NENHUMA",
  SEMANAL: "SEMANAL",
  MENSAL: "MENSAL",
  ANUAL: "ANUAL",
  PERSONALIZADA: "PERSONALIZADA",
};

export const recorrenciaSchema = z.string().transform((val, ctx) => {
  const key = normalizeString(val);
  const mapped = RECORRENCIA_MAP[key];
  if (!mapped) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Recorrencia invalida. As opcoes permitidas sao: Nenhuma, Semanal, Mensal, Anual, Personalizada.",
    });
    return z.NEVER;
  }
  return mapped;
});

const STATUS_MAP: Record<string, StatusEvento> = {
  PENDENTE: "PENDENTE",
  CONCLUIDO: "CONCLUIDO",
  CANCELADO: "CANCELADO",
};

export const statusSchema = z.string().transform((val, ctx) => {
  const key = normalizeString(val);
  const mapped = STATUS_MAP[key];
  if (!mapped) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Status invalido. Os valores permitidos sao: Pendente, Concluido, Cancelado.",
    });
    return z.NEVER;
  }
  return mapped;
});

export const dataHoraSchema = z
  .string()
  .trim()
  .refine((val) => {
    const d = new Date(val);
    return !Number.isNaN(d.getTime());
  }, "Informe uma data e hora valida no formato ISO 8601.")
  .transform((val) => new Date(val).toISOString());

export const createEventoSchema = z.preprocess(
  (arg) => {
    if (arg && typeof arg === "object") {
      const raw = arg as Record<string, unknown>;
      return {
        petId: raw.petId ?? raw.pet_id,
        clinicaId: raw.clinicaId ?? raw.clinica_id ?? null,
        tipoCuidado: raw.tipoCuidado ?? raw.tipo_cuidado,
        dataHora: raw.dataHora ?? raw.data_hora,
        recorrencia: raw.recorrencia ?? "NENHUMA",
        status: raw.status ?? "PENDENTE",
        descricao: raw.descricao,
      };
    }
    return arg;
  },
  z.object({
    petId: z.string().uuid("pet_id deve ser um UUID valido."),
    clinicaId: z.string().uuid("clinica_id deve ser um UUID valido.").nullable().optional().default(null),
    tipoCuidado: tipoCuidadoSchema,
    dataHora: dataHoraSchema,
    recorrencia: recorrenciaSchema.default("NENHUMA"),
    status: statusSchema.default("PENDENTE"),
    descricao: z.string().trim().max(255).nullable().optional().default(null),
  }),
);

export const updateEventoSchema = z.preprocess(
  (arg) => {
    if (arg && typeof arg === "object") {
      const raw = arg as Record<string, unknown>;
      const res: Record<string, unknown> = {};
      if ("clinicaId" in raw || "clinica_id" in raw) {
        res.clinicaId = raw.clinicaId ?? raw.clinica_id ?? null;
      }
      if ("tipoCuidado" in raw || "tipo_cuidado" in raw) {
        res.tipoCuidado = raw.tipoCuidado ?? raw.tipo_cuidado;
      }
      if ("dataHora" in raw || "data_hora" in raw) {
        res.dataHora = raw.dataHora ?? raw.data_hora;
      }
      if ("recorrencia" in raw) res.recorrencia = raw.recorrencia;
      if ("status" in raw) res.status = raw.status;
      if ("descricao" in raw) res.descricao = raw.descricao;
      return res;
    }
    return arg;
  },
  z
    .object({
      clinicaId: z.string().uuid("clinica_id deve ser um UUID valido.").nullable().optional(),
      tipoCuidado: tipoCuidadoSchema.optional(),
      dataHora: dataHoraSchema.optional(),
      recorrencia: recorrenciaSchema.optional(),
      status: statusSchema.optional(),
      descricao: z.string().trim().max(255).nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, "Informe ao menos um campo para atualizar."),
);

export const eventoIdParamSchema = z.object({
  id: z.string().uuid("O id do evento deve ser um UUID valido."),
});

export const listEventoQuerySchema = z.preprocess(
  (arg) => {
    if (arg && typeof arg === "object") {
      const raw = arg as Record<string, unknown>;
      return {
        ...raw,
        petId: raw.petId ?? raw.pet_id,
        clinicaId: raw.clinicaId ?? raw.clinica_id,
        q: raw.q ?? raw.busca ?? raw.search,
        tipoCuidado: raw.tipoCuidado ?? raw.tipo_cuidado ?? raw.categoria,
        status: raw.status,
        dataInicio: raw.dataInicio ?? raw.data_inicio ?? raw.startDate ?? raw.start_date,
        dataFim: raw.dataFim ?? raw.data_fim ?? raw.endDate ?? raw.end_date,
        page: raw.page ?? 1,
        limit: raw.limit ?? raw.pageSize ?? raw.page_size ?? 10,
        sortBy: raw.sortBy ?? raw.sort_by ?? "dataHora",
        sortOrder: raw.sortOrder ?? raw.sort_order ?? "asc",
      };
    }
    return arg;
  },
  z.object({
    petId: z.string().uuid("O petId deve ser um UUID valido.").optional(),
    clinicaId: z.string().uuid("O clinicaId deve ser um UUID valido.").optional(),
    q: z.string().trim().optional(),
    tipoCuidado: tipoCuidadoSchema.optional(),
    status: statusSchema.optional(),
    dataInicio: z
      .string()
      .trim()
      .refine((val) => !Number.isNaN(new Date(val).getTime()), "dataInicio deve ser uma data valida.")
      .optional(),
    dataFim: z
      .string()
      .trim()
      .refine((val) => !Number.isNaN(new Date(val).getTime()), "dataFim deve ser uma data valida.")
      .optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.enum(["dataHora", "createdAt"]).default("dataHora"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
);

export type ListEventoQueryInput = z.infer<typeof listEventoQuerySchema>;
