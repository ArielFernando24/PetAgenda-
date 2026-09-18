import type { CreatePetData, Pet, UpdatePetData } from "../domain/pet";
import { PetNotFoundError } from "../domain/pet.errors";
import type { PetRepository } from "./pet.repository";

export class PetService {
  constructor(private readonly repository: PetRepository) {}

  create(tutorId: string, data: Omit<CreatePetData, "tutorId">): Promise<Pet> {
    return this.repository.create({ ...data, tutorId });
  }

  list(tutorId: string): Promise<Pet[]> {
    return this.repository.findAllByTutor(tutorId);
  }

  async getById(tutorId: string, id: string): Promise<Pet> {
    const pet = await this.repository.findByIdForTutor(id, tutorId);
    if (!pet) throw new PetNotFoundError();
    return pet;
  }

  async update(tutorId: string, id: string, data: UpdatePetData): Promise<Pet> {
    const pet = await this.repository.updateForTutor(id, tutorId, data);
    if (!pet) throw new PetNotFoundError();
    return pet;
  }

  async delete(tutorId: string, id: string): Promise<void> {
    const deleted = await this.repository.deleteForTutor(id, tutorId);
    if (!deleted) throw new PetNotFoundError();
  }
}
