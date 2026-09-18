import type { CreatePetData, Pet, UpdatePetData } from "../domain/pet";

/**
 * Todas as operacoes recebem tutorId para impedir consultas sem escopo de dono.
 * Os adaptadores Prisma e de teste mantem o mesmo contrato.
 */
export interface PetRepository {
  create(data: CreatePetData): Promise<Pet>;
  findAllByTutor(tutorId: string): Promise<Pet[]>;
  findByIdForTutor(id: string, tutorId: string): Promise<Pet | null>;
  updateForTutor(id: string, tutorId: string, data: UpdatePetData): Promise<Pet | null>;
  deleteForTutor(id: string, tutorId: string): Promise<boolean>;
}
