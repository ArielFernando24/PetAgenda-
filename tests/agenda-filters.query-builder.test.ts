import request from "supertest";
import { createApp } from "../src/app";
import { InMemoryPetRepository } from "../src/modules/pets/infrastructure/in-memory-pet.repository";
import { InMemoryAgendaRepository } from "../src/modules/agenda/infrastructure/in-memory-agenda.repository";

const TUTOR_ID = "11111111-2222-3333-4444-555555555555";
const PET_ID = "99999999-8888-7777-6666-555555555555";

function setupApp() {
  const petRepo = new InMemoryPetRepository();
  const agendaRepo = new InMemoryAgendaRepository(async (petId) => {
    const pet = await petRepo.findByIdForTutor(petId, TUTOR_ID);
    if (pet) return TUTOR_ID;
    return null;
  });

  const app = createApp({
    petRepository: petRepo,
    agendaRepository: agendaRepo,
    authenticate: (req, _res, next) => {
      req.auth = { tutorId: TUTOR_ID };
      next();
    },
  });

  return { app, petRepo, agendaRepo };
}

describe("US06 — Listagem, Busca e Filtros Avançados (TASK-06.2 e TASK-06.4)", () => {
  let app: ReturnType<typeof setupApp>["app"];
  let petRepo: ReturnType<typeof setupApp>["petRepo"];
  let agendaRepo: ReturnType<typeof setupApp>["agendaRepo"];

  beforeEach(async () => {
    const setup = setupApp();
    app = setup.app;
    petRepo = setup.petRepo;
    agendaRepo = setup.agendaRepo;

    const pet = await petRepo.create({
      tutorId: TUTOR_ID,
      nome: "Rex",
      especie: "Cachorro",
      raca: "Labrador",
      sexo: "MACHO",
      dataNascimento: "2020-01-01",
    });

    const petId = pet.id;

    // 1. Vacina V10 em 10/10/2026
    await agendaRepo.create({
      petId,
      tipoCuidado: "VACINA",
      dataHora: "2026-10-10T10:00:00.000Z",
      status: "CONCLUIDO",
      descricao: "Dose anual da Vacina V10 importada",
    });

    // 2. Consulta de rotina em 15/10/2026
    await agendaRepo.create({
      petId,
      tipoCuidado: "CONSULTA",
      dataHora: "2026-10-15T14:00:00.000Z",
      status: "PENDENTE",
      descricao: "Consulta geral de rotina com cardiologista",
    });

    // 3. Banho e Tosa em 20/10/2026
    await agendaRepo.create({
      petId,
      tipoCuidado: "BANHO_E_TOSA",
      dataHora: "2026-10-20T09:00:00.000Z",
      status: "PENDENTE",
      descricao: "Banho anti-pulgas e tosa higienica",
    });

    // 4. Remedio Vermifugo em 25/10/2026
    await agendaRepo.create({
      petId,
      tipoCuidado: "VERMIFUGO",
      dataHora: "2026-10-25T08:00:00.000Z",
      status: "PENDENTE",
      descricao: "Vermifugo Drontal Plus 1 comprimido",
    });

    // 5. Vacina Antirrábica em 05/11/2026
    await agendaRepo.create({
      petId,
      tipoCuidado: "VACINA",
      dataHora: "2026-11-05T11:00:00.000Z",
      status: "CANCELADO",
      descricao: "Reforco da Vacina Antirrabica",
    });
  });

  describe("TASK-06.2: Query Builder & Filtros", () => {
    it("deve buscar parcialmente por palavra-chave em 'q' de modo insensível a maiúsculas/minúsculas", async () => {
      // Busca "vacina"
      const res = await request(app).get("/api/agenda?q=vacina");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.total).toBe(2);
      expect(res.body.data.every((ev: any) => ev.descricao.toLowerCase().includes("vacina"))).toBe(true);

      // Busca "CARDIOLOGISTA" em caixa alta
      const resUpper = await request(app).get("/api/agenda?q=CARDIOLOGISTA");
      expect(resUpper.status).toBe(200);
      expect(resUpper.body.data).toHaveLength(1);
      expect(resUpper.body.data[0].tipoCuidado).toBe("CONSULTA");
    });

    it("deve filtrar por categoria de cuidado (tipoCuidado)", async () => {
      const res = await request(app).get("/api/agenda?tipoCuidado=VACINA");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data.every((ev: any) => ev.tipoCuidado === "VACINA")).toBe(true);

      // Filtro via alias 'categoria=Consulta'
      const resAlias = await request(app).get("/api/agenda?categoria=Consulta");
      expect(resAlias.status).toBe(200);
      expect(resAlias.body.data).toHaveLength(1);
      expect(resAlias.body.data[0].tipoCuidado).toBe("CONSULTA");
    });

    it("deve filtrar por status do evento", async () => {
      const res = await request(app).get("/api/agenda?status=PENDENTE");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data.every((ev: any) => ev.status === "PENDENTE")).toBe(true);
    });

    it("deve filtrar por intervalo de datas (dataInicio e dataFim)", async () => {
      // Intervalo entre 12/10/2026 e 22/10/2026 (deve pegar o de 15/10 e 20/10)
      const res = await request(app).get(
        "/api/agenda?dataInicio=2026-10-12T00:00:00.000Z&dataFim=2026-10-22T23:59:59.000Z",
      );
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].tipoCuidado).toBe("CONSULTA");
      expect(res.body.data[1].tipoCuidado).toBe("BANHO_E_TOSA");
    });

    it("deve combinar múltiplos filtros dinamicamente (categoria + status + intervalo)", async () => {
      const res = await request(app).get(
        "/api/agenda?tipoCuidado=VACINA&status=CONCLUIDO&dataInicio=2026-10-01T00:00:00.000Z",
      );
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].tipoCuidado).toBe("VACINA");
      expect(res.body.data[0].status).toBe("CONCLUIDO");
    });

    it("deve paginar resultados por offset com metadados (total, page, limit, totalPages)", async () => {
      // Página 1 com limite 2 (de 5 totais)
      const resPage1 = await request(app).get("/api/agenda?page=1&limit=2");
      expect(resPage1.status).toBe(200);
      expect(resPage1.body.data).toHaveLength(2);
      expect(resPage1.body.meta).toEqual({
        total: 5,
        page: 1,
        limit: 2,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false,
      });

      // Página 2 com limite 2
      const resPage2 = await request(app).get("/api/agenda?page=2&limit=2");
      expect(resPage2.status).toBe(200);
      expect(resPage2.body.data).toHaveLength(2);
      expect(resPage2.body.meta.page).toBe(2);
      expect(resPage2.body.meta.hasNextPage).toBe(true);
      expect(resPage2.body.meta.hasPrevPage).toBe(true);

      // Página 3 (última página com 1 item)
      const resPage3 = await request(app).get("/api/agenda?page=3&limit=2");
      expect(resPage3.status).toBe(200);
      expect(resPage3.body.data).toHaveLength(1);
      expect(resPage3.body.meta.hasNextPage).toBe(false);
      expect(resPage3.body.meta.hasPrevPage).toBe(true);
    });
  });

  describe("TASK-06.4: QA, Empty States & Performance", () => {
    it("deve retornar Empty State estruturado (data: [], meta.total: 0) quando nenhum resultado coincidir", async () => {
      const res = await request(app).get("/api/agenda?q=termo_completamente_inexistente_xyz");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
      expect(res.body.meta.totalPages).toBe(0);
      expect(res.body.meta.hasNextPage).toBe(false);
      expect(res.body.meta.hasPrevPage).toBe(false);
    });

    it("deve retornar array vazio sem falhar quando consultar página além do total (page > totalPages)", async () => {
      const res = await request(app).get("/api/agenda?page=99&limit=10");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(5);
      expect(res.body.meta.page).toBe(99);
      expect(res.body.meta.hasNextPage).toBe(false);
      expect(res.body.meta.hasPrevPage).toBe(true);
    });

    it("deve responder em tempo de alta performance (< 300ms)", async () => {
      const start = Date.now();
      const res = await request(app).get("/api/agenda?page=1&limit=10");
      const elapsed = Date.now() - start;

      expect(res.status).toBe(200);
      expect(elapsed).toBeLessThan(300);
    });
  });
});
