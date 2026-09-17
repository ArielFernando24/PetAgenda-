import request from "supertest";
import { createApp } from "../../src/app";
import jwt from "jsonwebtoken";
import { env } from "../../src/config/env";
import { InMemoryPetRepository } from "../../src/modules/pets/infrastructure/in-memory-pet.repository";
import { InMemoryAgendaRepository } from "../../src/modules/agenda/infrastructure/in-memory-agenda.repository";

const TUTOR_A = "00000000-0000-4000-8000-000000000001";
const TUTOR_B = "00000000-0000-4000-8000-000000000002";

jest.mock("../../src/config/prisma", () => ({
  prisma: {
    tutor: {
      findUnique: jest.fn(async ({ where }) =>
        [TUTOR_A, TUTOR_B].includes(where.id) ? { id: where.id } : null,
      ),
    },
  },
}));

const bearer = (id: string) => "Bearer " + jwt.sign({ tutor_id: id }, env.JWT_SECRET);

function createTestEnvironment() {
  const petRepo = new InMemoryPetRepository();
  const agendaRepo = new InMemoryAgendaRepository(async (petId) => {
    const petA = await petRepo.findByIdForTutor(petId, TUTOR_A);
    if (petA) return TUTOR_A;
    const petB = await petRepo.findByIdForTutor(petId, TUTOR_B);
    if (petB) return TUTOR_B;
    return null;
  });

  const app = createApp({ petRepository: petRepo, agendaRepository: agendaRepo });
  return { app, petRepo, agendaRepo };
}

describe("API de Agenda (US03)", () => {
  it("exige autenticação JWT para acessar a agenda", async () => {
    const { app } = createTestEnvironment();
    const response = await request(app).get("/api/agenda");

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Token");
  });

  describe("Task 3.2: Validação estrita de tipos de cuidados", () => {
    it("rejeita tipo_cuidado não permitido", async () => {
      const { app, petRepo } = createTestEnvironment();
      const pet = await petRepo.create({
        tutorId: TUTOR_A,
        nome: "Rex",
        especie: "Cachorro",
        raca: null,
        sexo: "MACHO",
        dataNascimento: "2020-01-01",
      });

      const response = await request(app)
        .post("/api/agenda")
        .set("Authorization", bearer(TUTOR_A))
        .send({
          pet_id: pet.id,
          tipo_cuidado: "Adestramento",
          data_hora: "2026-10-01T10:00:00.000Z",
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "tipoCuidado",
            message: expect.stringContaining("Tipo de cuidado invalido"),
          }),
        ]),
      );
    });

    it("aceita todos os tipos de cuidado permitidos (Vacina, Vermifugo, Banho & Tosa, Consulta, Remédio)", async () => {
      const { app, petRepo } = createTestEnvironment();
      const pet = await petRepo.create({
        tutorId: TUTOR_A,
        nome: "Rex",
        especie: "Cachorro",
        raca: null,
        sexo: "MACHO",
        dataNascimento: "2020-01-01",
      });

      const validTypes = [
        { input: "Vacina", expected: "VACINA" },
        { input: "Vermifugo", expected: "VERMIFUGO" },
        { input: "Banho & Tosa", expected: "BANHO_E_TOSA" },
        { input: "Consulta", expected: "CONSULTA" },
        { input: "Remédio", expected: "REMEDIO" },
      ];

      for (const { input, expected } of validTypes) {
        const res = await request(app)
          .post("/api/agenda")
          .set("Authorization", bearer(TUTOR_A))
          .send({
            pet_id: pet.id,
            tipo_cuidado: input,
            data_hora: "2026-10-10T09:00:00.000Z",
          });

        expect(res.status).toBe(201);
        expect(res.body.data.tipoCuidado).toBe(expected);
      }
    });
  });

  describe("Task 3.3: Endpoint de Agendamento (POST /api/agenda)", () => {
    it("persiste corretamente parâmetros de recorrência (Semanal, Mensal, Anual, Personalizada)", async () => {
      const { app, petRepo } = createTestEnvironment();
      const pet = await petRepo.create({
        tutorId: TUTOR_A,
        nome: "Mimi",
        especie: "Gato",
        raca: null,
        sexo: "FEMEA",
        dataNascimento: "2021-05-01",
      });

      const recurrences = [
        { input: "Semanal", expected: "SEMANAL" },
        { input: "Mensal", expected: "MENSAL" },
        { input: "Anual", expected: "ANUAL" },
        { input: "Personalizada", expected: "PERSONALIZADA" },
      ];

      for (const { input, expected } of recurrences) {
        const res = await request(app)
          .post("/api/agenda")
          .set("Authorization", bearer(TUTOR_A))
          .send({
            pet_id: pet.id,
            tipo_cuidado: "Vacina",
            data_hora: "2026-11-01T14:00:00.000Z",
            recorrencia: input,
          });

        expect(res.status).toBe(201);
        expect(res.body.data.recorrencia).toBe(expected);
        expect(res.body.data.status).toBe("PENDENTE");
      }
    });

    it("rejeita agendamento para pet pertencente a outro tutor", async () => {
      const { app, petRepo } = createTestEnvironment();
      const petB = await petRepo.create({
        tutorId: TUTOR_B,
        nome: "Bob",
        especie: "Cachorro",
        raca: null,
        sexo: "MACHO",
        dataNascimento: "2019-01-01",
      });

      const res = await request(app)
        .post("/api/agenda")
        .set("Authorization", bearer(TUTOR_A))
        .send({
          pet_id: petB.id,
          tipo_cuidado: "Consulta",
          data_hora: "2026-11-01T14:00:00.000Z",
        });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("PET_NOT_FOUND");
    });
  });

  describe("Task 3.4: Endpoint de Listagem (GET /api/agenda)", () => {
    it("retorna eventos ordenados cronologicamente", async () => {
      const { app, petRepo } = createTestEnvironment();
      const pet = await petRepo.create({
        tutorId: TUTOR_A,
        nome: "Bidu",
        especie: "Cachorro",
        raca: null,
        sexo: "MACHO",
        dataNascimento: "2022-01-01",
      });

      // Evento 2: Novembro
      await request(app)
        .post("/api/agenda")
        .set("Authorization", bearer(TUTOR_A))
        .send({
          pet_id: pet.id,
          tipo_cuidado: "Banho & Tosa",
          data_hora: "2026-11-20T10:00:00.000Z",
        });

      // Evento 1: Outubro
      await request(app)
        .post("/api/agenda")
        .set("Authorization", bearer(TUTOR_A))
        .send({
          pet_id: pet.id,
          tipo_cuidado: "Vacina",
          data_hora: "2026-10-05T08:30:00.000Z",
        });

      // Evento 3: Dezembro
      await request(app)
        .post("/api/agenda")
        .set("Authorization", bearer(TUTOR_A))
        .send({
          pet_id: pet.id,
          tipo_cuidado: "Consulta",
          data_hora: "2026-12-15T16:00:00.000Z",
        });

      const res = await request(app)
        .get("/api/agenda")
        .set("Authorization", bearer(TUTOR_A));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data[0].tipoCuidado).toBe("VACINA");
      expect(res.body.data[1].tipoCuidado).toBe("BANHO_E_TOSA");
      expect(res.body.data[2].tipoCuidado).toBe("CONSULTA");
    });

    it("filtra por petId quando informado", async () => {
      const { app, petRepo } = createTestEnvironment();
      const pet1 = await petRepo.create({
        tutorId: TUTOR_A,
        nome: "Pet Um",
        especie: "Gato",
        raca: null,
        sexo: "FEMEA",
        dataNascimento: "2021-01-01",
      });
      const pet2 = await petRepo.create({
        tutorId: TUTOR_A,
        nome: "Pet Dois",
        especie: "Cachorro",
        raca: null,
        sexo: "MACHO",
        dataNascimento: "2021-02-02",
      });

      await request(app)
        .post("/api/agenda")
        .set("Authorization", bearer(TUTOR_A))
        .send({
          pet_id: pet1.id,
          tipo_cuidado: "Vacina",
          data_hora: "2026-10-10T10:00:00.000Z",
        });

      await request(app)
        .post("/api/agenda")
        .set("Authorization", bearer(TUTOR_A))
        .send({
          pet_id: pet2.id,
          tipo_cuidado: "Consulta",
          data_hora: "2026-10-12T10:00:00.000Z",
        });

      const res = await request(app)
        .get(`/api/agenda?petId=${pet1.id}`)
        .set("Authorization", bearer(TUTOR_A));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].petId).toBe(pet1.id);
    });

    it("mantém isolamento entre tutores na listagem", async () => {
      const { app, petRepo } = createTestEnvironment();
      const petA = await petRepo.create({
        tutorId: TUTOR_A,
        nome: "Tutor A Pet",
        especie: "Gato",
        raca: null,
        sexo: "FEMEA",
        dataNascimento: "2021-01-01",
      });

      await request(app)
        .post("/api/agenda")
        .set("Authorization", bearer(TUTOR_A))
        .send({
          pet_id: petA.id,
          tipo_cuidado: "Vacina",
          data_hora: "2026-10-10T10:00:00.000Z",
        });

      const resTutorB = await request(app)
        .get("/api/agenda")
        .set("Authorization", bearer(TUTOR_B));

      expect(resTutorB.status).toBe(200);
      expect(resTutorB.body.data).toEqual([]);
    });
  });

  describe("Task 3.5: Endpoints de Gestão (PUT e DELETE /api/agenda/:id)", () => {
    it("atualiza um evento agendado", async () => {
      const { app, petRepo } = createTestEnvironment();
      const pet = await petRepo.create({
        tutorId: TUTOR_A,
        nome: "Max",
        especie: "Cachorro",
        raca: null,
        sexo: "MACHO",
        dataNascimento: "2022-01-01",
      });

      const created = await request(app)
        .post("/api/agenda")
        .set("Authorization", bearer(TUTOR_A))
        .send({
          pet_id: pet.id,
          tipo_cuidado: "Consulta",
          data_hora: "2026-10-01T10:00:00.000Z",
        });

      const eventoId = created.body.data.id;

      const updated = await request(app)
        .put(`/api/agenda/${eventoId}`)
        .set("Authorization", bearer(TUTOR_A))
        .send({
          status: "Concluído",
          descricao: "Consulta de rotina realizada com sucesso.",
        });

      expect(updated.status).toBe(200);
      expect(updated.body.data.status).toBe("CONCLUIDO");
      expect(updated.body.data.descricao).toBe("Consulta de rotina realizada com sucesso.");
    });

    it("deleta um evento agendado", async () => {
      const { app, petRepo } = createTestEnvironment();
      const pet = await petRepo.create({
        tutorId: TUTOR_A,
        nome: "Max",
        especie: "Cachorro",
        raca: null,
        sexo: "MACHO",
        dataNascimento: "2022-01-01",
      });

      const created = await request(app)
        .post("/api/agenda")
        .set("Authorization", bearer(TUTOR_A))
        .send({
          pet_id: pet.id,
          tipo_cuidado: "Remédio",
          data_hora: "2026-10-01T10:00:00.000Z",
        });

      const eventoId = created.body.data.id;

      const delRes = await request(app)
        .delete(`/api/agenda/${eventoId}`)
        .set("Authorization", bearer(TUTOR_A));

      expect(delRes.status).toBe(204);

      const getRes = await request(app)
        .get(`/api/agenda/${eventoId}`)
        .set("Authorization", bearer(TUTOR_A));

      expect(getRes.status).toBe(404);
      expect(getRes.body.error.code).toBe("EVENTO_NOT_FOUND");
    });

    it("rejeita tentativa de outro tutor atualizar ou deletar evento", async () => {
      const { app, petRepo } = createTestEnvironment();
      const pet = await petRepo.create({
        tutorId: TUTOR_A,
        nome: "Max",
        especie: "Cachorro",
        raca: null,
        sexo: "MACHO",
        dataNascimento: "2022-01-01",
      });

      const created = await request(app)
        .post("/api/agenda")
        .set("Authorization", bearer(TUTOR_A))
        .send({
          pet_id: pet.id,
          tipo_cuidado: "Consulta",
          data_hora: "2026-10-01T10:00:00.000Z",
        });

      const eventoId = created.body.data.id;

      const forbiddenUpdate = await request(app)
        .put(`/api/agenda/${eventoId}`)
        .set("Authorization", bearer(TUTOR_B))
        .send({ status: "Concluído" });

      expect(forbiddenUpdate.status).toBe(404);
      expect(forbiddenUpdate.body.error.code).toBe("EVENTO_NOT_FOUND");

      const forbiddenDelete = await request(app)
        .delete(`/api/agenda/${eventoId}`)
        .set("Authorization", bearer(TUTOR_B));

      expect(forbiddenDelete.status).toBe(404);
      expect(forbiddenDelete.body.error.code).toBe("EVENTO_NOT_FOUND");
    });
  });
});
