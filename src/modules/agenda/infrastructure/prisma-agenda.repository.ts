import type { Evento as StoredEvento, PrismaClient } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import type { AgendaRepository, ListEventosFilter } from "../application/agenda.repository";
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
        tipoCuidado: data.tipoCuidado,
        dataHora: new Date(data.dataHora),
        recorrencia: data.recorrencia ?? "NENHUMA",
        status: data.status ?? "PENDENTE",
        descricao: data.descricao ?? null,
      },
    });

    return fromDatabase(evento);
  }

  async findAllByTutor(tutorId: string, filter?: ListEventosFilter): Promise<Evento[]> {
    const eventos = await this.client.evento.findMany({
      where: {
        pet: { tutorId },
        ...(filter?.petId ? { petId: filter.petId } : {}),
      },
      orderBy: [
        { dataHora: "asc" },
        { id: "asc" },
      ],
    });

    return eventos.map(fromDatabase);
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
