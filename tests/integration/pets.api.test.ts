import request from "supertest";
import { createApp } from "../../src/app";

const TUTOR_A = "00000000-0000-4000-8000-000000000001";
const TUTOR_B = "00000000-0000-4000-8000-000000000002";

const validPet = {
  nome: "Luna",
  especie: "Cachorro",
  raca: "Vira-lata",
  sexo: "FEMEA",
  dataNascimento: "2022-05-10",
};

describe("API de pets", () => {
  it("exige a identificacao temporaria do tutor", async () => {
    const response = await request(createApp()).get("/api/pets");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejeita dados invalidos e nascimento no futuro", async () => {
    const response = await request(createApp())
      .post("/api/pets")
      .set("x-tutor-id", TUTOR_A)
      .send({ ...validPet, nome: "", dataNascimento: "2999-01-01" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "nome" }),
        expect.objectContaining({ field: "dataNascimento" }),
      ]),
    );
  });

  it("responde 400 quando o corpo nao e um JSON valido", async () => {
    const response = await request(createApp())
      .post("/api/pets")
      .set("x-tutor-id", TUTOR_A)
      .set("Content-Type", "application/json")
      .send('{"nome":');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_JSON");
  });

  it("executa o CRUD e mantem o isolamento entre tutores", async () => {
    const app = createApp();
    const created = await request(app)
      .post("/api/pets")
      .set("x-tutor-id", TUTOR_A)
      .send(validPet);

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject(validPet);
    const petId = created.body.data.id as string;

    const ownerList = await request(app).get("/api/pets").set("x-tutor-id", TUTOR_A);
    const otherTutorList = await request(app)
      .get("/api/pets")
      .set("x-tutor-id", TUTOR_B);

    expect(ownerList.body.data).toHaveLength(1);
    expect(otherTutorList.body.data).toEqual([]);

    const forbiddenRead = await request(app)
      .get(`/api/pets/${petId}`)
      .set("x-tutor-id", TUTOR_B);
    expect(forbiddenRead.status).toBe(404);

    const updated = await request(app)
      .put(`/api/pets/${petId}`)
      .set("x-tutor-id", TUTOR_A)
      .send({ raca: "SRD" });
    expect(updated.status).toBe(200);
    expect(updated.body.data.raca).toBe("SRD");
    expect(updated.body.data.sexo).toBe("FEMEA");

    const deleted = await request(app)
      .delete(`/api/pets/${petId}`)
      .set("x-tutor-id", TUTOR_A);
    expect(deleted.status).toBe(204);

    const missing = await request(app)
      .get(`/api/pets/${petId}`)
      .set("x-tutor-id", TUTOR_A);
    expect(missing.status).toBe(404);
  });

  it("expoe um health check sem autenticacao", async () => {
    const response = await request(createApp()).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
