import { randomUUID } from "node:crypto";
import type { AgendaRepository, ListEventosFilter } from "../application/agenda.repository";
import type { CreateEventoData, Evento, UpdateEventoData } from "../domain/evento";

interface InMemoryAgendaRepositoryOptions {
  generateId?: () => string;
  now?: () => Date;
}

export class InMemoryAgendaRepository implements AgendaRepository {
  private readonly eventos = new Map<string, Evento>();
  private readonly generateId: () => string;
  private readonly now: () => Date;

  constructor(
    private readonly getPetTutorId?: (petId: string) => Promise<string | null> | string | null,
    options: InMemoryAgendaRepositoryOptions = {},
  ) {
    this.generateId = options.generateId ?? randomUUID;
    this.now = options.now ?? (() => new Date());
  }

  async create(data: CreateEventoData): Promise<Evento> {
    const timestamp = this.now();
    const evento: Evento = {
      id: this.generateId(),
      petId: data.petId,
      clinicaId: data.clinicaId ?? null,
      tipoCuidado: data.tipoCuidado,
      dataHora: data.dataHora,
      recorrencia: data.recorrencia ?? "NENHUMA",
      status: data.status ?? "PENDENTE",
      descricao: data.descricao ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.eventos.set(evento.id, evento);
    return { ...evento };
  }

  async findAllByTutor(tutorId: string, filter?: ListEventosFilter): Promise<Evento[]> {
    const all = [...this.eventos.values()];
    const result: Evento[] = [];

    for (const ev of all) {
      if (filter?.petId && ev.petId !== filter.petId) {
        continue;
      }
      if (this.getPetTutorId) {
        const petTutor = await this.getPetTutorId(ev.petId);
        if (petTutor !== tutorId) continue;
      }
      result.push({ ...ev });
    }

    return result;
  }

  async findByIdForTutor(id: string, tutorId: string): Promise<Evento | null> {
    const ev = this.eventos.get(id);
    if (!ev) return null;

    if (this.getPetTutorId) {
      const petTutor = await this.getPetTutorId(ev.petId);
      if (petTutor !== tutorId) return null;
    }

    return { ...ev };
  }

  async updateForTutor(id: string, tutorId: string, data: UpdateEventoData): Promise<Evento | null> {
    const existing = await this.findByIdForTutor(id, tutorId);
    if (!existing) return null;

    const updated: Evento = {
      ...existing,
      ...data,
      updatedAt: this.now(),
    };
    this.eventos.set(id, updated);
    return { ...updated };
  }

  async deleteForTutor(id: string, tutorId: string): Promise<boolean> {
    const existing = await this.findByIdForTutor(id, tutorId);
    if (!existing) return false;

    return this.eventos.delete(id);
  }
}
