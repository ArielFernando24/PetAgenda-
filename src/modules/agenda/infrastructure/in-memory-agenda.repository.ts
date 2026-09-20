import { randomUUID } from "node:crypto";
import type { AgendaRepository, ListEventosFilter, PaginatedResult } from "../application/agenda.repository";
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

  async findAllByTutor(tutorId: string, filter?: ListEventosFilter): Promise<PaginatedResult<Evento>> {
    const all = [...this.eventos.values()];
    const filtered: Evento[] = [];

    for (const ev of all) {
      if (filter?.petId && ev.petId !== filter.petId) {
        continue;
      }
      if (filter?.clinicaId && ev.clinicaId !== filter.clinicaId) {
        continue;
      }
      if (filter?.tipoCuidado && ev.tipoCuidado !== filter.tipoCuidado) {
        continue;
      }
      if (filter?.status && ev.status !== filter.status) {
        continue;
      }
      if (filter?.dataInicio && new Date(ev.dataHora).getTime() < new Date(filter.dataInicio).getTime()) {
        continue;
      }
      if (filter?.dataFim && new Date(ev.dataHora).getTime() > new Date(filter.dataFim).getTime()) {
        continue;
      }
      if (filter?.q && filter.q.trim()) {
        const term = filter.q.trim().toLowerCase();
        const descMatch = (ev.descricao || "").toLowerCase().includes(term);
        if (!descMatch) continue;
      }
      if (this.getPetTutorId) {
        const petTutor = await this.getPetTutorId(ev.petId);
        if (petTutor !== tutorId) continue;
      }
      filtered.push({ ...ev });
    }

    const sortBy = filter?.sortBy === "createdAt" ? "createdAt" : "dataHora";
    const sortOrder = filter?.sortOrder === "desc" ? "desc" : "asc";

    filtered.sort((a, b) => {
      const timeA = new Date(a[sortBy] as any).getTime();
      const timeB = new Date(b[sortBy] as any).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });

    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const limit = filter?.limit && filter.limit > 0 ? filter.limit : 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
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
