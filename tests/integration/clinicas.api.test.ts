import request from "supertest";
import { createApp } from "../../src/app";
import jwt from "jsonwebtoken";
import { env } from "../../src/config/env";
import { InMemoryClinicaRepository } from "../../src/modules/clinicas/infrastructure/in-memory-clinica.repository";

const TUTOR_ID = "00000000-0000-4000-8000-000000000001";

jest.mock("../../src/config/prisma", () => ({
  prisma: {
    tutor: {
      findUnique: jest.fn(async ({ where }) =>
        where.id === TUTOR_ID ? { id: TUTOR_ID } : null,
      ),
    },
  },
}));

const bearer = (id: string) => "Bearer " + jwt.sign({ tutor_id: id }, env.JWT_SECRET);

function createTestEnvironment() {
  const clinicaRepo = new InMemoryClinicaRepository();
  const app = createApp({ clinicaRepository: clinicaRepo });
  return { app, clinicaRepo };
}

describe("API de Clínicas Veterinárias", () => {
  it("permite listar clínicas e buscar por filtros (GET /api/clinicas)", async () => {
    const { app, clinicaRepo } = createTestEnvironment();

    await clinicaRepo.create({
      nome: "Clínica Pet Feliz",
      telefone: "(11) 3333-4444",
      endereco: "Av. Paulista, 1500",
      cidade: "São Paulo",
      estado: "SP",
      servicos: ["Consulta", "Vacinação", "Banho e Tosa"],
      horarioFuncionamento: "Seg a Sáb 08h-20h",
    });

    await clinicaRepo.create({
      nome: "Hospital Vet Campinas",
      telefone: "(19) 3222-1111",
      endereco: "Av. Norte Sul, 800",
      cidade: "Campinas",
      estado: "SP",
      servicos: ["Cirurgia", "Internação"],
    });

    // Listar todas
    const resAll = await request(app).get("/api/clinicas");
    expect(resAll.status).toBe(200);
    expect(resAll.body.data).toHaveLength(2);

    // Filtrar por cidade
    const resCampinas = await request(app).get("/api/clinicas?cidade=Campinas");
    expect(resCampinas.status).toBe(200);
    expect(resCampinas.body.data).toHaveLength(1);
    expect(resCampinas.body.data[0].nome).toBe("Hospital Vet Campinas");

    // Filtrar por serviço
    const resVacina = await request(app).get("/api/clinicas?servico=Vacinação");
    expect(resVacina.status).toBe(200);
    expect(resVacina.body.data).toHaveLength(1);
    expect(resVacina.body.data[0].nome).toBe("Clínica Pet Feliz");
  });

  it("retorna detalhes do perfil da clínica por ID (GET /api/clinicas/:id)", async () => {
    const { app, clinicaRepo } = createTestEnvironment();

    const clinica = await clinicaRepo.create({
      nome: "Centro Veterinário Alfa",
      telefone: "11988889999",
      email: "contato@alfa.vet.br",
      endereco: "Rua Vergueiro, 2000",
      cidade: "São Paulo",
      estado: "SP",
      horarioFuncionamento: "24h",
      servicos: ["Exames", "Vacinas"],
      descricao: "Clínica com laboratório próprio.",
    });

    const res = await request(app).get(`/api/clinicas/${clinica.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(clinica.id);
    expect(res.body.data.nome).toBe("Centro Veterinário Alfa");
    expect(res.body.data.email).toBe("contato@alfa.vet.br");
    expect(res.body.data.descricao).toBe("Clínica com laboratório próprio.");
  });

  it("retorna 404 CLINICA_NOT_FOUND para ID inexistente", async () => {
    const { app } = createTestEnvironment();
    const fakeId = "00000000-0000-4000-8000-000000000999";

    const res = await request(app).get(`/api/clinicas/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("CLINICA_NOT_FOUND");
  });

  it("cadastra uma nova clínica (POST /api/clinicas)", async () => {
    const { app } = createTestEnvironment();

    const payload = {
      nome: "Clínica Veterinária Morumbi",
      telefone: "(11) 3740-0000",
      email: "morumbi@vet.com",
      endereco: "Av. Giovanni Gronchi, 3000",
      cidade: "São Paulo",
      estado: "SP",
      horarioFuncionamento: "Seg a Sex 08h-19h",
      servicos: ["Cirurgia", "Oftalmologia", "Dermatologia"],
      descricao: "Especialistas em animais de pequeno porte.",
    };

    const res = await request(app)
      .post("/api/clinicas")
      .set("Authorization", bearer(TUTOR_ID))
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.nome).toBe(payload.nome);
    expect(res.body.data.servicos).toEqual(payload.servicos);
  });

  it("rejeita cadastro com dados inválidos (400 VALIDATION_ERROR)", async () => {
    const { app } = createTestEnvironment();

    const invalidPayload = {
      nome: "A", // curto demais
      telefone: "123", // curto demais
      endereco: "",
      cidade: "",
      estado: "SAOPAULO", // deve ser sigla de 2 letras
    };

    const res = await request(app)
      .post("/api/clinicas")
      .set("Authorization", bearer(TUTOR_ID))
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.length).toBeGreaterThanOrEqual(4);
  });

  it("atualiza dados do perfil da clínica (PUT /api/clinicas/:id)", async () => {
    const { app, clinicaRepo } = createTestEnvironment();

    const clinica = await clinicaRepo.create({
      nome: "Clínica Vet Sul",
      telefone: "11988880000",
      endereco: "Av. Interlagos, 500",
      cidade: "São Paulo",
      estado: "SP",
    });

    const res = await request(app)
      .put(`/api/clinicas/${clinica.id}`)
      .set("Authorization", bearer(TUTOR_ID))
      .send({
        descricao: "Agora atendemos também exóticos e aves.",
        horarioFuncionamento: "Plantão 24h",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.descricao).toBe("Agora atendemos também exóticos e aves.");
    expect(res.body.data.horarioFuncionamento).toBe("Plantão 24h");
  });

  it("remove uma clínica (DELETE /api/clinicas/:id)", async () => {
    const { app, clinicaRepo } = createTestEnvironment();

    const clinica = await clinicaRepo.create({
      nome: "Vet Para Excluir",
      telefone: "11988881111",
      endereco: "Rua X, 10",
      cidade: "São Paulo",
      estado: "SP",
    });

    const resDel = await request(app)
      .delete(`/api/clinicas/${clinica.id}`)
      .set("Authorization", bearer(TUTOR_ID));

    expect(resDel.status).toBe(204);

    const resGet = await request(app).get(`/api/clinicas/${clinica.id}`);
    expect(resGet.status).toBe(404);
  });

  describe("Endpoints do Painel de Gestão da Clínica", () => {
    it("lista os atendimentos agendados para a clínica (GET /api/clinicas/:id/atendimentos)", async () => {
      const { app, clinicaRepo } = createTestEnvironment();

      const clinica = await clinicaRepo.create({
        nome: "Hospital Vet Jardins",
        telefone: "11988884444",
        endereco: "Al. Lorena, 100",
        cidade: "São Paulo",
        estado: "SP",
      });

      const eventoId1 = "00000000-0000-4000-8000-000000000100";
      clinicaRepo.addAtendimento({
        id: eventoId1,
        clinicaId: clinica.id,
        tipoCuidado: "VACINA",
        dataHora: "2026-10-20T10:00:00.000Z",
        status: "PENDENTE",
        recorrencia: "ANUAL",
        descricao: "Reforço V10",
        pet: { id: "00000000-0000-4000-8000-000000000011", nome: "Bob", especie: "Cachorro", raca: "Beagle" },
        tutor: { id: "00000000-0000-4000-8000-000000000021", nome: "Mariana", email: "mariana@email.com" },
      });

      const res = await request(app)
        .get(`/api/clinicas/${clinica.id}/atendimentos`)
        .set("Authorization", bearer(TUTOR_ID));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].pet.nome).toBe("Bob");
      expect(res.body.data[0].tutor.nome).toBe("Mariana");
    });

    it("atualiza status e anotações do atendimento (PUT /api/clinicas/:id/atendimentos/:eventoId)", async () => {
      const { app, clinicaRepo } = createTestEnvironment();

      const clinica = await clinicaRepo.create({
        nome: "Hospital Vet Jardins",
        telefone: "11988884444",
        endereco: "Al. Lorena, 100",
        cidade: "São Paulo",
        estado: "SP",
      });

      const eventoId2 = "00000000-0000-4000-8000-000000000200";
      clinicaRepo.addAtendimento({
        id: eventoId2,
        clinicaId: clinica.id,
        tipoCuidado: "CONSULTA",
        dataHora: "2026-10-21T11:00:00.000Z",
        status: "PENDENTE",
        recorrencia: "NENHUMA",
        descricao: null,
        pet: { id: "00000000-0000-4000-8000-000000000012", nome: "Mimi", especie: "Gato", raca: null },
        tutor: { id: "00000000-0000-4000-8000-000000000022", nome: "Felipe", email: "felipe@email.com" },
      });

      const res = await request(app)
        .put(`/api/clinicas/${clinica.id}/atendimentos/${eventoId2}`)
        .set("Authorization", bearer(TUTOR_ID))
        .send({
          status: "Concluído",
          descricao: "Consulta cardiológica normal. Sem alterações no eletrocardiograma.",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("CONCLUIDO");
      expect(res.body.data.descricao).toContain("Consulta cardiológica normal");
    });

    it("retorna o resumo com métricas de gestão (GET /api/clinicas/:id/resumo)", async () => {
      const { app, clinicaRepo } = createTestEnvironment();

      const clinica = await clinicaRepo.create({
        nome: "Hospital Vet Paulista",
        telefone: "11988885555",
        endereco: "Av. Paulista, 10",
        cidade: "São Paulo",
        estado: "SP",
      });

      const eventoId3 = "00000000-0000-4000-8000-000000000300";
      clinicaRepo.addAtendimento({
        id: eventoId3,
        clinicaId: clinica.id,
        tipoCuidado: "CONSULTA",
        dataHora: "2026-10-22T09:00:00.000Z",
        status: "PENDENTE",
        recorrencia: "NENHUMA",
        descricao: null,
        pet: { id: "00000000-0000-4000-8000-000000000013", nome: "Thor", especie: "Cachorro", raca: "Golden" },
        tutor: { id: "00000000-0000-4000-8000-000000000023", nome: "Lucas", email: "lucas@email.com" },
      });

      const res = await request(app)
        .get(`/api/clinicas/${clinica.id}/resumo`)
        .set("Authorization", bearer(TUTOR_ID));

      expect(res.status).toBe(200);
      expect(res.body.data.totalAtendimentos).toBe(1);
      expect(res.body.data.pendentes).toBe(1);
      expect(res.body.data.concluidos).toBe(0);
      expect(res.body.data.proximosAtendimentos).toHaveLength(1);
    });
  });
});
