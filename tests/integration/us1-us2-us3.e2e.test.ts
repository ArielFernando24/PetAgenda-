import request from "supertest";
import { createApp } from "../../src/app";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../../src/config/env";
import { InMemoryPetRepository } from "../../src/modules/pets/infrastructure/in-memory-pet.repository";
import { InMemoryAgendaRepository } from "../../src/modules/agenda/infrastructure/in-memory-agenda.repository";

const TUTOR_A = "11111111-1111-4111-8111-111111111111";
const TUTOR_B = "22222222-2222-4222-8222-222222222222";

const mockTutors = [
  {
    id: TUTOR_A,
    nome: "Carlos Eduardo",
    email: "carlos@exemplo.com",
    senha_hash: bcrypt.hashSync("senhaSegura123", 10),
  },
  {
    id: TUTOR_B,
    nome: "Juliana Santos",
    email: "juliana@exemplo.com",
    senha_hash: bcrypt.hashSync("outraSenha456", 10),
  },
];

jest.mock("../../src/config/prisma", () => ({
  prisma: {
    tutor: {
      findUnique: jest.fn(async ({ where }: { where: { id?: string; email?: string } }) => {
        if (where.id) {
          return mockTutors.find((t) => t.id === where.id) ?? null;
        }
        if (where.email) {
          return mockTutors.find((t) => t.email === where.email) ?? null;
        }
        return null;
      }),
    },
  },
}));

function setupIntegratedApp() {
  const petRepo = new InMemoryPetRepository();
  const agendaRepo = new InMemoryAgendaRepository(async (petId) => {
    const petA = await petRepo.findByIdForTutor(petId, TUTOR_A);
    if (petA) return TUTOR_A;
    const petB = await petRepo.findByIdForTutor(petId, TUTOR_B);
    if (petB) return TUTOR_B;
    return null;
  });

  const app = createApp({
    petRepository: petRepo,
    agendaRepository: agendaRepo,
  });

  return { app, petRepo, agendaRepo };
}

describe("Integração Completa: US01 (Autenticação) + US02 (Pets) + US03 (Agenda)", () => {
  let app: ReturnType<typeof createApp>;
  let tokenTutorA: string;
  let tokenTutorB: string;

  beforeAll(async () => {
    const envSetup = setupIntegratedApp();
    app = envSetup.app;

    // US01: Realizar Login do Tutor A via endpoint oficial de autenticação
    const loginResA = await request(app).post("/api/auth/login").send({
      email: "carlos@exemplo.com",
      senha: "senhaSegura123",
    });
    expect(loginResA.status).toBe(200);
    expect(loginResA.body.data.token).toBeDefined();
    tokenTutorA = `Bearer ${loginResA.body.data.token}`;

    // US01: Realizar Login do Tutor B via endpoint oficial de autenticação
    const loginResB = await request(app).post("/api/auth/login").send({
      email: "juliana@exemplo.com",
      senha: "outraSenha456",
    });
    expect(loginResB.status).toBe(200);
    expect(loginResB.body.data.token).toBeDefined();
    tokenTutorB = `Bearer ${loginResB.body.data.token}`;
  });

  it("executa o ciclo de vida completo: cadastro de pets (US02) e agendamento de cuidados (US03) com isolamento por tutor (US01)", async () => {
    // -------------------------------------------------------------
    // ETAPA 1 (US02): Cadastro de pets pelos tutores via HTTP
    // -------------------------------------------------------------
    // Tutor A cadastra o cão "Thor"
    const petThorRes = await request(app)
      .post("/api/pets")
      .set("Authorization", tokenTutorA)
      .send({
        nome: "Thor",
        especie: "Cachorro",
        raca: "Golden Retriever",
        sexo: "MACHO",
        dataNascimento: "2021-04-10",
      });
    expect(petThorRes.status).toBe(201);
    const thorId = petThorRes.body.data.id;
    expect(thorId).toBeDefined();

    // Tutor A cadastra a gata "Mel"
    const petMelRes = await request(app)
      .post("/api/pets")
      .set("Authorization", tokenTutorA)
      .send({
        nome: "Mel",
        especie: "Gato",
        raca: "Siamês",
        sexo: "FEMEA",
        dataNascimento: "2022-08-15",
      });
    expect(petMelRes.status).toBe(201);
    const melId = petMelRes.body.data.id;
    expect(melId).toBeDefined();

    // Tutor B cadastra a cadela "Pipoca"
    const petPipocaRes = await request(app)
      .post("/api/pets")
      .set("Authorization", tokenTutorB)
      .send({
        nome: "Pipoca",
        especie: "Cachorro",
        raca: "Poodle",
        sexo: "FEMEA",
        dataNascimento: "2023-01-20",
      });
    expect(petPipocaRes.status).toBe(201);
    const pipocaId = petPipocaRes.body.data.id;
    expect(pipocaId).toBeDefined();

    // Valida que Tutor A vê 2 pets e Tutor B vê 1 pet
    const listPetsA = await request(app).get("/api/pets").set("Authorization", tokenTutorA);
    expect(listPetsA.status).toBe(200);
    expect(listPetsA.body.data).toHaveLength(2);

    const listPetsB = await request(app).get("/api/pets").set("Authorization", tokenTutorB);
    expect(listPetsB.status).toBe(200);
    expect(listPetsB.body.data).toHaveLength(1);
    expect(listPetsB.body.data[0].id).toBe(pipocaId);

    // -------------------------------------------------------------
    // ETAPA 2 (US03): Agendamento de eventos nos pets
    // -------------------------------------------------------------
    // Tutor A agenda "Banho & Tosa" para Thor (Data: 2026-10-01) com recorrência SEMANAL
    const evento1Res = await request(app)
      .post("/api/agenda")
      .set("Authorization", tokenTutorA)
      .send({
        pet_id: thorId,
        tipo_cuidado: "Banho & Tosa",
        data_hora: "2026-10-01T09:00:00.000Z",
        recorrencia: "Semanal",
        descricao: "Tosa higiênica e banho com shampoo neutro",
      });
    expect(evento1Res.status).toBe(201);
    expect(evento1Res.body.data.tipoCuidado).toBe("BANHO_E_TOSA");
    expect(evento1Res.body.data.recorrencia).toBe("SEMANAL");
    expect(evento1Res.body.data.status).toBe("PENDENTE");
    const eventoBanhoThorId = evento1Res.body.data.id;

    // Tutor A agenda "Vacina" para Thor mais tarde (Data: 2026-10-15)
    const evento2Res = await request(app)
      .post("/api/agenda")
      .set("Authorization", tokenTutorA)
      .send({
        pet_id: thorId,
        tipo_cuidado: "Vacina",
        data_hora: "2026-10-15T14:30:00.000Z",
        descricao: "Dose de reforço anual V10",
      });
    expect(evento2Res.status).toBe(201);
    expect(evento2Res.body.data.tipoCuidado).toBe("VACINA");
    const eventoVacinaThorId = evento2Res.body.data.id;

    // Tutor A agenda "Consulta" para Mel (Data: 2026-11-05)
    const evento3Res = await request(app)
      .post("/api/agenda")
      .set("Authorization", tokenTutorA)
      .send({
        pet_id: melId,
        tipo_cuidado: "Consulta",
        data_hora: "2026-11-05T16:00:00.000Z",
        descricao: "Check-up oftalmológico",
      });
    expect(evento3Res.status).toBe(201);
    expect(evento3Res.body.data.tipoCuidado).toBe("CONSULTA");
    const eventoConsultaMelId = evento3Res.body.data.id;

    // Tutor B agenda "Vermífugo" para Pipoca (Data: 2026-10-10)
    const evento4Res = await request(app)
      .post("/api/agenda")
      .set("Authorization", tokenTutorB)
      .send({
        pet_id: pipocaId,
        tipo_cuidado: "Vermífugo",
        data_hora: "2026-10-10T08:00:00.000Z",
        recorrencia: "Mensal",
      });
    expect(evento4Res.status).toBe(201);
    expect(evento4Res.body.data.tipoCuidado).toBe("VERMIFUGO");
    const eventoVermifugoPipocaId = evento4Res.body.data.id;

    // -------------------------------------------------------------
    // ETAPA 3 (US03): Listagem geral e ordenação cronológica
    // -------------------------------------------------------------
    // Tutor A lista sua agenda: deve conter 3 eventos, ordenados cronologicamente:
    // 1º: 2026-10-01 (Banho & Tosa)
    // 2º: 2026-10-15 (Vacina)
    // 3º: 2026-11-05 (Consulta)
    const agendaTutorARes = await request(app)
      .get("/api/agenda")
      .set("Authorization", tokenTutorA);

    expect(agendaTutorARes.status).toBe(200);
    expect(agendaTutorARes.body.data).toHaveLength(3);
    expect(agendaTutorARes.body.data[0].id).toBe(eventoBanhoThorId);
    expect(agendaTutorARes.body.data[1].id).toBe(eventoVacinaThorId);
    expect(agendaTutorARes.body.data[2].id).toBe(eventoConsultaMelId);

    // Tutor B lista sua agenda: deve conter apenas 1 evento (de Pipoca)
    const agendaTutorBRes = await request(app)
      .get("/api/agenda")
      .set("Authorization", tokenTutorB);

    expect(agendaTutorBRes.status).toBe(200);
    expect(agendaTutorBRes.body.data).toHaveLength(1);
    expect(agendaTutorBRes.body.data[0].id).toBe(eventoVermifugoPipocaId);
    expect(agendaTutorBRes.body.data[0].petId).toBe(pipocaId);

    // -------------------------------------------------------------
    // ETAPA 4 (US03): Filtro de agenda por petId
    // -------------------------------------------------------------
    // Tutor A filtra por Thor: deve retornar apenas os 2 eventos de Thor
    const thorAgendaRes = await request(app)
      .get(`/api/agenda?petId=${thorId}`)
      .set("Authorization", tokenTutorA);

    expect(thorAgendaRes.status).toBe(200);
    expect(thorAgendaRes.body.data).toHaveLength(2);
    expect(thorAgendaRes.body.data.every((ev: any) => ev.petId === thorId)).toBe(true);

    // Tutor A filtra por Mel: deve retornar apenas o evento de Mel
    const melAgendaRes = await request(app)
      .get(`/api/agenda?petId=${melId}`)
      .set("Authorization", tokenTutorA);

    expect(melAgendaRes.status).toBe(200);
    expect(melAgendaRes.body.data).toHaveLength(1);
    expect(melAgendaRes.body.data[0].id).toBe(eventoConsultaMelId);

    // -------------------------------------------------------------
    // ETAPA 5 (Segurança Cruzada US01 x US02 x US03):
    // -------------------------------------------------------------
    // 5.1. Tutor B tenta criar agendamento para o pet de Tutor A (Thor) -> 404 (PET_NOT_FOUND)
    const invasaoAgendamento = await request(app)
      .post("/api/agenda")
      .set("Authorization", tokenTutorB)
      .send({
        pet_id: thorId,
        tipo_cuidado: "Consulta",
        data_hora: "2026-10-25T10:00:00.000Z",
      });
    expect(invasaoAgendamento.status).toBe(404);
    expect(invasaoAgendamento.body.error.code).toBe("PET_NOT_FOUND");

    // 5.2. Tutor A tenta filtrar sua agenda pelo pet de Tutor B (Pipoca) -> 404 (PET_NOT_FOUND)
    const invasaoFiltro = await request(app)
      .get(`/api/agenda?petId=${pipocaId}`)
      .set("Authorization", tokenTutorA);
    expect(invasaoFiltro.status).toBe(404);
    expect(invasaoFiltro.body.error.code).toBe("PET_NOT_FOUND");

    // 5.3. Tutor B tenta obter detalhes de um evento de Tutor A -> 404 (EVENTO_NOT_FOUND)
    const invasaoGet = await request(app)
      .get(`/api/agenda/${eventoVacinaThorId}`)
      .set("Authorization", tokenTutorB);
    expect(invasaoGet.status).toBe(404);
    expect(invasaoGet.body.error.code).toBe("EVENTO_NOT_FOUND");

    // 5.4. Tutor B tenta alterar status do evento de Tutor A -> 404 (EVENTO_NOT_FOUND)
    const invasaoUpdate = await request(app)
      .put(`/api/agenda/${eventoVacinaThorId}`)
      .set("Authorization", tokenTutorB)
      .send({ status: "Concluído" });
    expect(invasaoUpdate.status).toBe(404);
    expect(invasaoUpdate.body.error.code).toBe("EVENTO_NOT_FOUND");

    // 5.5. Tutor B tenta excluir evento de Tutor A -> 404 (EVENTO_NOT_FOUND)
    const invasaoDelete = await request(app)
      .delete(`/api/agenda/${eventoVacinaThorId}`)
      .set("Authorization", tokenTutorB);
    expect(invasaoDelete.status).toBe(404);
    expect(invasaoDelete.body.error.code).toBe("EVENTO_NOT_FOUND");

    // -------------------------------------------------------------
    // ETAPA 6 (US03): Atualização do evento pelo próprio tutor
    // -------------------------------------------------------------
    // Tutor A marca o Banho de Thor como Concluído
    const updateRes = await request(app)
      .put(`/api/agenda/${eventoBanhoThorId}`)
      .set("Authorization", tokenTutorA)
      .send({
        status: "Concluído",
        descricao: "Banho realizado. O cão foi muito dócil.",
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe("CONCLUIDO");
    expect(updateRes.body.data.descricao).toBe("Banho realizado. O cão foi muito dócil.");

    // -------------------------------------------------------------
    // ETAPA 7 (US03): Cancelamento / Exclusão do evento pelo tutor
    // -------------------------------------------------------------
    // Tutor A deleta o agendamento de Vacina
    const deleteRes = await request(app)
      .delete(`/api/agenda/${eventoVacinaThorId}`)
      .set("Authorization", tokenTutorA);

    expect(deleteRes.status).toBe(204);

    // Confirma que não existe mais
    const getDeletedRes = await request(app)
      .get(`/api/agenda/${eventoVacinaThorId}`)
      .set("Authorization", tokenTutorA);
    expect(getDeletedRes.status).toBe(404);

    // Agenda de Tutor A agora tem apenas 2 eventos
    const agendaFinalA = await request(app)
      .get("/api/agenda")
      .set("Authorization", tokenTutorA);
    expect(agendaFinalA.status).toBe(200);
    expect(agendaFinalA.body.data).toHaveLength(2);
  });
});
