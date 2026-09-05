import { PetService } from "../../src/modules/pets/application/pet.service";
import { PetNotFoundError } from "../../src/modules/pets/domain/pet.errors";
import { InMemoryPetRepository } from "../../src/modules/pets/infrastructure/in-memory-pet.repository";

const TUTOR_A = "00000000-0000-4000-8000-000000000001";
const TUTOR_B = "00000000-0000-4000-8000-000000000002";

function makeService() {
  const repository = new InMemoryPetRepository({
    generateId: () => "10000000-0000-4000-8000-000000000001",
    now: () => new Date("2026-08-28T12:00:00.000Z"),
  });
  return new PetService(repository);
}

describe("PetService", () => {
  it("cria e lista pets apenas para o tutor dono", async () => {
    const service = makeService();

    const created = await service.create(TUTOR_A, {
      nome: "Luna",
      especie: "Cachorro",
      raca: "Vira-lata",
      sexo: "FEMEA",
      dataNascimento: "2022-05-10",
    });

    expect(created.tutorId).toBe(TUTOR_A);
    await expect(service.list(TUTOR_A)).resolves.toHaveLength(1);
    await expect(service.list(TUTOR_B)).resolves.toEqual([]);
  });

  it("nao revela um pet pertencente a outro tutor", async () => {
    const service = makeService();
    const created = await service.create(TUTOR_A, {
      nome: "Luna",
      especie: "Cachorro",
      raca: null,
      sexo: "FEMEA",
      dataNascimento: "2022-05-10",
    });

    await expect(service.getById(TUTOR_B, created.id)).rejects.toBeInstanceOf(
      PetNotFoundError,
    );
  });

  it("atualiza e remove um pet do tutor", async () => {
    const service = makeService();
    const created = await service.create(TUTOR_A, {
      nome: "Luna",
      especie: "Cachorro",
      raca: null,
      sexo: "FEMEA",
      dataNascimento: "2022-05-10",
    });

    await expect(service.update(TUTOR_A, created.id, { raca: "SRD" })).resolves.toMatchObject({
      raca: "SRD",
    });
    await service.delete(TUTOR_A, created.id);
    await expect(service.getById(TUTOR_A, created.id)).rejects.toBeInstanceOf(
      PetNotFoundError,
    );
  });
});
