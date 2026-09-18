import { AgendaService } from "../../src/modules/agenda/application/agenda.service";
import {
  EventoNotFoundError,
  PetForbiddenOrNotFoundError,
} from "../../src/modules/agenda/domain/agenda.errors";
import { InMemoryAgendaRepository } from "../../src/modules/agenda/infrastructure/in-memory-agenda.repository";
import { InMemoryPetRepository } from "../../src/modules/pets/infrastructure/in-memory-pet.repository";

const TUTOR_A = "00000000-0000-4000-8000-000000000001";
const TUTOR_B = "00000000-0000-4000-8000-000000000002";

function makeSetup() {
  const petRepo = new InMemoryPetRepository();
  const agendaRepo = new InMemoryAgendaRepository(async (petId) => {
    // Busca o pet para descobrir de qual tutor ele é
    const petA = await petRepo.findByIdForTutor(petId, TUTOR_A);
    if (petA) return TUTOR_A;
    const petB = await petRepo.findByIdForTutor(petId, TUTOR_B);
    if (petB) return TUTOR_B;
    return null;
  });

  const service = new AgendaService(agendaRepo, petRepo);
  return { petRepo, agendaRepo, service };
}

describe("AgendaService (Unit)", () => {
  it("permite criar e listar eventos na ordem cronológica", async () => {
    const { petRepo, service } = makeSetup();

    const pet = await petRepo.create({
      tutorId: TUTOR_A,
      nome: "Pipoca",
      especie: "Cachorro",
      raca: "Poodle",
      sexo: "FEMEA",
      dataNascimento: "2021-01-01",
    });

    // Cria evento mais tarde
    await service.create(TUTOR_A, {
      petId: pet.id,
      tipoCuidado: "BANHO_E_TOSA",
      dataHora: "2026-10-15T15:00:00.000Z",
      recorrencia: "SEMANAL",
    });

    // Cria evento mais cedo
    await service.create(TUTOR_A, {
      petId: pet.id,
      tipoCuidado: "VACINA",
      dataHora: "2026-09-20T10:00:00.000Z",
      recorrencia: "NENHUMA",
    });

    const list = await service.list(TUTOR_A);
    expect(list).toHaveLength(2);
    // Deve estar ordenado cronologicamente (setembro antes de outubro)
    expect(list[0].tipoCuidado).toBe("VACINA");
    expect(list[1].tipoCuidado).toBe("BANHO_E_TOSA");
  });

  it("impede agendar evento para pet inexistente ou de outro tutor", async () => {
    const { petRepo, service } = makeSetup();

    const petB = await petRepo.create({
      tutorId: TUTOR_B,
      nome: "Thor",
      especie: "Gato",
      raca: null,
      sexo: "MACHO",
      dataNascimento: "2020-03-01",
    });

    await expect(
      service.create(TUTOR_A, {
        petId: petB.id,
        tipoCuidado: "CONSULTA",
        dataHora: "2026-10-01T09:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(PetForbiddenOrNotFoundError);
  });

  it("atualiza e remove evento pertencente ao tutor", async () => {
    const { petRepo, service } = makeSetup();

    const pet = await petRepo.create({
      tutorId: TUTOR_A,
      nome: "Mel",
      especie: "Gato",
      raca: null,
      sexo: "FEMEA",
      dataNascimento: "2022-02-02",
    });

    const evento = await service.create(TUTOR_A, {
      petId: pet.id,
      tipoCuidado: "VERMIFUGO",
      dataHora: "2026-09-25T08:00:00.000Z",
      status: "PENDENTE",
    });

    const updated = await service.update(TUTOR_A, evento.id, {
      status: "CONCLUIDO",
    });
    expect(updated.status).toBe("CONCLUIDO");

    await service.delete(TUTOR_A, evento.id);
    await expect(service.getById(TUTOR_A, evento.id)).rejects.toBeInstanceOf(
      EventoNotFoundError,
    );
  });
});
