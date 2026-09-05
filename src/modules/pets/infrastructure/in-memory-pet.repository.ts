import { randomUUID } from "node:crypto";
import type { PetRepository } from "../application/pet.repository";
import type { CreatePetData, Pet, UpdatePetData } from "../domain/pet";

interface InMemoryPetRepositoryOptions {
  generateId?: () => string;
  now?: () => Date;
}

export class InMemoryPetRepository implements PetRepository {
  private readonly pets = new Map<string, Pet>();
  private readonly generateId: () => string;
  private readonly now: () => Date;

  constructor(options: InMemoryPetRepositoryOptions = {}) {
    this.generateId = options.generateId ?? randomUUID;
    this.now = options.now ?? (() => new Date());
  }

  async create(data: CreatePetData): Promise<Pet> {
    const timestamp = this.now();
    const pet: Pet = {
      id: this.generateId(),
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.pets.set(pet.id, pet);
    return { ...pet };
  }

  async findAllByTutor(tutorId: string): Promise<Pet[]> {
    return [...this.pets.values()]
      .filter((pet) => pet.tutorId === tutorId)
      .map((pet) => ({ ...pet }));
  }

  async findByIdForTutor(id: string, tutorId: string): Promise<Pet | null> {
    const pet = this.pets.get(id);
    return pet?.tutorId === tutorId ? { ...pet } : null;
  }

  async updateForTutor(
    id: string,
    tutorId: string,
    data: UpdatePetData,
  ): Promise<Pet | null> {
    const current = this.pets.get(id);
    if (!current || current.tutorId !== tutorId) return null;

    const updated: Pet = {
      ...current,
      ...data,
      updatedAt: this.now(),
    };
    this.pets.set(id, updated);
    return { ...updated };
  }

  async deleteForTutor(id: string, tutorId: string): Promise<boolean> {
    const current = this.pets.get(id);
    if (!current || current.tutorId !== tutorId) return false;
    return this.pets.delete(id);
  }
}
