import { Prisma, type Pet as StoredPet, type PrismaClient } from '@prisma/client';
import { prisma } from '../../../config/prisma';
import type { PetRepository } from '../application/pet.repository';
import type { CreatePetData, Pet, UpdatePetData } from '../domain/pet';

function fromDatabase(pet: StoredPet): Pet {
  return { ...pet, dataNascimento: pet.dataNascimento.toISOString().slice(0, 10) };
}

export class PrismaPetRepository implements PetRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  async create(data: CreatePetData): Promise<Pet> {
    const pet = await this.client.pet.create({
      data: { ...data, dataNascimento: new Date(data.dataNascimento + 'T00:00:00.000Z') },
    });
    return fromDatabase(pet);
  }

  async findAllByTutor(tutorId: string): Promise<Pet[]> {
    const pets = await this.client.pet.findMany({
      where: { tutorId }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    return pets.map(fromDatabase);
  }

  async findByIdForTutor(id: string, tutorId: string): Promise<Pet | null> {
    const pet = await this.client.pet.findFirst({ where: { id, tutorId } });
    return pet ? fromDatabase(pet) : null;
  }

  async updateForTutor(id: string, tutorId: string, data: UpdatePetData): Promise<Pet | null> {
    try {
      // O escopo do tutor faz parte do UPDATE, evitando checagem de posse separada.
      const pet = await this.client.pet.update({
        where: { id, tutorId },
        data: {
          ...data,
          dataNascimento: data.dataNascimento === undefined
            ? undefined : new Date(data.dataNascimento + 'T00:00:00.000Z'),
        },
      });
      return fromDatabase(pet);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return null;
      throw error;
    }
  }

  async deleteForTutor(id: string, tutorId: string): Promise<boolean> {
    const result = await this.client.pet.deleteMany({ where: { id, tutorId } });
    return result.count === 1;
  }
}
