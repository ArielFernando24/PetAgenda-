import type {
  CreateEventoData,
  Evento,
  Recorrencia,
  StatusEvento,
  TipoCuidado,
  UpdateEventoData,
} from "../domain/evento";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ListEventosFilter {
  petId?: string;
  clinicaId?: string;
  q?: string;
  tipoCuidado?: TipoCuidado;
  status?: StatusEvento;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
  sortBy?: "dataHora" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface AgendaRepository {
  create(data: CreateEventoData): Promise<Evento>;
  findAllByTutor(tutorId: string, filter?: ListEventosFilter): Promise<PaginatedResult<Evento>>;
  findByIdForTutor(id: string, tutorId: string): Promise<Evento | null>;
  updateForTutor(id: string, tutorId: string, data: UpdateEventoData): Promise<Evento | null>;
  deleteForTutor(id: string, tutorId: string): Promise<boolean>;
}
