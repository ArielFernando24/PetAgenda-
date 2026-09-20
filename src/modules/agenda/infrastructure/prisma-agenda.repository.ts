import type { Evento as StoredEvento, PrismaClient } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import type { AgendaRepository, ListEventosFilter, PaginatedResult } from "../application/agenda.repository";
import type { CreateEventoData, Evento, UpdateEventoData } from "../domain/evento";

function fromDatabase(evento: StoredEvento): Evento {
  return {
    ...evento,
    dataHora: evento.dataHora.toISOString(),
  };
}

export class PrismaAgendaRepository implements AgendaRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  async create(data: CreateEventoData): Promise<Evento> {
    const evento = await this.client.evento.create({
      data: {
        petId: data.petId,
        clinicaId: data.clinicaId ?? null,
        tipoCuidado: data.tipoCuidado,
        dataHora: new Date(data.dataHora),
        recorrencia: data.recorrencia ?? "NENHUMA",
        status: data.status ?? "PENDENTE",
        descricao: data.descricao ?? null,
      },
    });

    return fromDatabase(evento);
  }

  async findAllByTutor(tutorId: string, filter?: ListEventosFilter): Promise<PaginatedResult<Evento>> {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const limit = filter?.limit && filter.limit > 0 ? filter.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {
      pet: { tutorId },
    };

    if (filter?.petId) {
      where.petId = filter.petId;
    }

    if (filter?.clinicaId) {
      where.clinicaId = filter.clinicaId;
    }

    if (filter?.tipoCuidado) {
      where.tipoCuidado = filter.tipoCuidado;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.dataInicio || filter?.dataFim) {
      where.dataHora = {
        ...(filter.dataInicio ? { gte: new Date(filter.dataInicio) } : {}),
        ...(filter.dataFim ? { lte: new Date(filter.dataFim) } : {}),
      };
    }

    if (filter?.q && filter.q.trim()) {
      const searchTerm = filter.q.trim();
      where.OR = [
        { descricao: { contains: searchTerm, mode: "insensitive" } },
        { pet: { nome: { contains: searchTerm, mode: "insensitive" } } },
      ];
    }

    const sortBy = filter?.sortBy === "createdAt" ? "createdAt" : "dataHora";
    const sortOrder = filter?.sortOrder === "desc" ? "desc" : "asc";

    const [total, eventos] = await Promise.all([
      this.client.evento.count({ where }),
      this.client.evento.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { [sortBy]: sortOrder },
          { id: "asc" },
        ],
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: eventos.map(fromDatabase),
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
    const evento = await this.client.evento.findFirst({
      where: {
        id,
        pet: { tutorId },
      },
    });

    return evento ? fromDatabase(evento) : null;
  }

  async updateForTutor(
    id: string,
    tutorId: string,
    data: UpdateEventoData,
  ): Promise<Evento | null> {
    const existing = await this.findByIdForTutor(id, tutorId);
    if (!existing) return null;

    const updated = await this.client.evento.update({
      where: { id },
      data: {
        clinicaId: data.clinicaId !== undefined ? data.clinicaId : undefined,
        tipoCuidado: data.tipoCuidado,
        dataHora: data.dataHora ? new Date(data.dataHora) : undefined,
        recorrencia: data.recorrencia,
        status: data.status,
        descricao: data.descricao,
      },
    });

    return fromDatabase(updated);
  }

  async deleteForTutor(id: string, tutorId: string): Promise<boolean> {
    const existing = await this.findByIdForTutor(id, tutorId);
    if (!existing) return false;

    await this.client.evento.delete({ where: { id } });
    return true;
  }
}
