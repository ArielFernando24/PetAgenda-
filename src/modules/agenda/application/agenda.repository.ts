import type { CreateEventoData, Evento, UpdateEventoData } from "../domain/evento";

export interface ListEventosFilter {
  petId?: string;
}

export interface AgendaRepository {
  create(data: CreateEventoData): Promise<Evento>;
  findAllByTutor(tutorId: string, filter?: ListEventosFilter): Promise<Evento[]>;
  findByIdForTutor(id: string, tutorId: string): Promise<Evento | null>;
  updateForTutor(id: string, tutorId: string, data: UpdateEventoData): Promise<Evento | null>;
  deleteForTutor(id: string, tutorId: string): Promise<boolean>;
}
