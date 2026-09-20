import type { PetRepository } from "../../pets/application/pet.repository";
import type { AgendaRepository, ListEventosFilter, PaginatedResult } from "./agenda.repository";
import type { CreateEventoData, Evento, UpdateEventoData } from "../domain/evento";
import { EventoNotFoundError, PetForbiddenOrNotFoundError } from "../domain/agenda.errors";

export class AgendaService {
  constructor(
    private readonly repository: AgendaRepository,
    private readonly petRepository: PetRepository,
  ) {}

  async create(tutorId: string, data: CreateEventoData): Promise<Evento> {
    const pet = await this.petRepository.findByIdForTutor(data.petId, tutorId);
    if (!pet) {
      throw new PetForbiddenOrNotFoundError();
    }
    return this.repository.create(data);
  }

  async list(tutorId: string, filter?: ListEventosFilter): Promise<PaginatedResult<Evento>> {
    if (filter?.petId) {
      const pet = await this.petRepository.findByIdForTutor(filter.petId, tutorId);
      if (!pet) {
        throw new PetForbiddenOrNotFoundError();
      }
    }

    return this.repository.findAllByTutor(tutorId, filter);
  }

  async getById(tutorId: string, id: string): Promise<Evento> {
    const evento = await this.repository.findByIdForTutor(id, tutorId);
    if (!evento) throw new EventoNotFoundError();
    return evento;
  }

  async update(tutorId: string, id: string, data: UpdateEventoData): Promise<Evento> {
    const evento = await this.repository.updateForTutor(id, tutorId, data);
    if (!evento) throw new EventoNotFoundError();
    return evento;
  }

  async delete(tutorId: string, id: string): Promise<void> {
    const deleted = await this.repository.deleteForTutor(id, tutorId);
    if (!deleted) throw new EventoNotFoundError();
  }
}
