export const TIPO_CUIDADO_VALUES = [
  "VACINA",
  "VERMIFUGO",
  "BANHO_E_TOSA",
  "CONSULTA",
  "REMEDIO",
] as const;

export type TipoCuidado = (typeof TIPO_CUIDADO_VALUES)[number];

export const RECORRENCIA_VALUES = [
  "NENHUMA",
  "SEMANAL",
  "MENSAL",
  "ANUAL",
  "PERSONALIZADA",
] as const;

export type Recorrencia = (typeof RECORRENCIA_VALUES)[number];

export const STATUS_EVENTO_VALUES = [
  "PENDENTE",
  "CONCLUIDO",
  "CANCELADO",
] as const;

export type StatusEvento = (typeof STATUS_EVENTO_VALUES)[number];

export interface Evento {
  id: string;
  petId: string;
  clinicaId?: string | null;
  tipoCuidado: TipoCuidado;
  dataHora: string;
  recorrencia: Recorrencia;
  status: StatusEvento;
  descricao: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventoData {
  petId: string;
  clinicaId?: string | null;
  tipoCuidado: TipoCuidado;
  dataHora: string;
  recorrencia?: Recorrencia;
  status?: StatusEvento;
  descricao?: string | null;
}

export type UpdateEventoData = Partial<Omit<CreateEventoData, "petId">>;
