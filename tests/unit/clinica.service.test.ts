import { ClinicaService } from "../../src/modules/clinicas/application/clinica.service";
import { ClinicaNotFoundError } from "../../src/modules/clinicas/domain/clinica.errors";
import { InMemoryClinicaRepository } from "../../src/modules/clinicas/infrastructure/in-memory-clinica.repository";

describe("ClinicaService (Unit)", () => {
  let repository: InMemoryClinicaRepository;
  let service: ClinicaService;

  beforeEach(() => {
    repository = new InMemoryClinicaRepository();
    service = new ClinicaService(repository);
  });

  it("permite cadastrar e obter uma clínica pelo ID", async () => {
    const created = await service.create({
      nome: "Hospital Veterinário São Francisco",
      telefone: "(11) 98765-4321",
      email: "contato@saofrancisco.vet.br",
      endereco: "Av. Paulista, 1000",
      cidade: "São Paulo",
      estado: "SP",
      horarioFuncionamento: "24 horas",
      servicos: ["Cirurgia", "Internação", "Vacinação", "Plantão 24h"],
      descricao: "Atendimento completo para cães e gatos.",
    });

    expect(created.id).toBeDefined();
    expect(created.nome).toBe("Hospital Veterinário São Francisco");
    expect(created.servicos).toContain("Plantão 24h");

    const found = await service.getById(created.id);
    expect(found).toEqual(created);
  });

  it("lança ClinicaNotFoundError se a clínica não existir", async () => {
    await expect(service.getById("00000000-0000-0000-0000-000000000000")).rejects.toBeInstanceOf(
      ClinicaNotFoundError,
    );
  });

  it("filtra clínicas por nome, cidade, estado e serviço", async () => {
    await service.create({
      nome: "Pet Care Jardins",
      telefone: "11999990001",
      endereco: "Rua Augusta, 500",
      cidade: "São Paulo",
      estado: "SP",
      servicos: ["Vacinação", "Banho e Tosa"],
    });

    await service.create({
      nome: "Clínica Vet Campinas",
      telefone: "19999990002",
      endereco: "Av. Brasil, 200",
      cidade: "Campinas",
      estado: "SP",
      servicos: ["Vacinação", "Cirurgia"],
    });

    await service.create({
      nome: "Centro Veterinário Carioca",
      telefone: "21999990003",
      endereco: "Rua Copacabana, 100",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      servicos: ["Banho e Tosa"],
    });

    // Filtro por cidade
    const spList = await service.list({ cidade: "São Paulo" });
    expect(spList).toHaveLength(1);
    expect(spList[0].nome).toBe("Pet Care Jardins");

    // Filtro por estado
    const rjList = await service.list({ estado: "RJ" });
    expect(rjList).toHaveLength(1);
    expect(rjList[0].nome).toBe("Centro Veterinário Carioca");

    // Filtro por serviço
    const vacinaList = await service.list({ servico: "Vacinação" });
    expect(vacinaList).toHaveLength(2);

    // Filtro por busca de texto (nome ou endereço)
    const buscaList = await service.list({ busca: "Augusta" });
    expect(buscaList).toHaveLength(1);
    expect(buscaList[0].nome).toBe("Pet Care Jardins");
  });

  it("atualiza dados do perfil da clínica", async () => {
    const clinica = await service.create({
      nome: "Clínica Bicho Mimado",
      telefone: "11988887777",
      endereco: "Rua das Flores, 123",
      cidade: "São Paulo",
      estado: "SP",
    });

    const updated = await service.update(clinica.id, {
      horarioFuncionamento: "Seg a Sex 08h-19h",
      descricao: "Nova gestão e instalações modernizadas.",
    });

    expect(updated.horarioFuncionamento).toBe("Seg a Sex 08h-19h");
    expect(updated.descricao).toBe("Nova gestão e instalações modernizadas.");
    expect(updated.nome).toBe("Clínica Bicho Mimado");
  });

  it("remove uma clínica existente", async () => {
    const clinica = await service.create({
      nome: "Vet Temporária",
      telefone: "11988880000",
      endereco: "Rua Teste, 1",
      cidade: "São Paulo",
      estado: "SP",
    });

    await service.delete(clinica.id);
    await expect(service.getById(clinica.id)).rejects.toBeInstanceOf(ClinicaNotFoundError);
  });

  describe("Painel de Gestão e Atendimentos", () => {
    it("lista atendimentos da clínica com dados de pet e tutor", async () => {
      const clinica = await service.create({
        nome: "Hospital Vet 24h",
        telefone: "11999991111",
        endereco: "Av. Brasil, 100",
        cidade: "São Paulo",
        estado: "SP",
      });

      repository.addAtendimento({
        id: "evento-1",
        clinicaId: clinica.id,
        tipoCuidado: "VACINA",
        dataHora: "2026-10-10T10:00:00.000Z",
        status: "PENDENTE",
        recorrencia: "ANUAL",
        descricao: "Vacina antirrábica",
        pet: { id: "pet-1", nome: "Rex", especie: "Cachorro", raca: "Pastor Alemão" },
        tutor: { id: "tutor-1", nome: "Carlos", email: "carlos@email.com" },
      });

      repository.addAtendimento({
        id: "evento-2",
        clinicaId: clinica.id,
        tipoCuidado: "CONSULTA",
        dataHora: "2026-10-12T15:00:00.000Z",
        status: "CONCLUIDO",
        recorrencia: "NENHUMA",
        descricao: "Check-up geral",
        pet: { id: "pet-2", nome: "Mimi", especie: "Gato", raca: "Persa" },
        tutor: { id: "tutor-2", nome: "Ana", email: "ana@email.com" },
      });

      const atendimentos = await service.listAtendimentos(clinica.id);
      expect(atendimentos).toHaveLength(2);
      expect(atendimentos[0].pet.nome).toBe("Rex");
      expect(atendimentos[0].tutor.nome).toBe("Carlos");

      // Filtro por status
      const pendentes = await service.listAtendimentos(clinica.id, { status: "PENDENTE" });
      expect(pendentes).toHaveLength(1);
      expect(pendentes[0].id).toBe("evento-1");
    });

    it("atualiza status e anotações do atendimento", async () => {
      const clinica = await service.create({
        nome: "Clínica Saúde Animal",
        telefone: "11999992222",
        endereco: "Rua das Palmeiras, 50",
        cidade: "São Paulo",
        estado: "SP",
      });

      repository.addAtendimento({
        id: "evento-3",
        clinicaId: clinica.id,
        tipoCuidado: "BANHO_E_TOSA",
        dataHora: "2026-10-15T09:00:00.000Z",
        status: "PENDENTE",
        recorrencia: "MENSAL",
        descricao: null,
        pet: { id: "pet-3", nome: "Pipoca", especie: "Cachorro", raca: "Poodle" },
        tutor: { id: "tutor-3", nome: "Juliana", email: "juliana@email.com" },
      });

      const updated = await service.updateAtendimento(clinica.id, "evento-3", {
        status: "CONCLUIDO",
        descricao: "Banho e tosa realizados. Pet sem pulgas ou carrapatos.",
      });

      expect(updated.status).toBe("CONCLUIDO");
      expect(updated.descricao).toContain("Pet sem pulgas");
    });

    it("retorna o resumo do painel de gestão com contagens e próximos atendimentos", async () => {
      const clinica = await service.create({
        nome: "Centro Vet Leste",
        telefone: "11999993333",
        endereco: "Rua Tatuapé, 300",
        cidade: "São Paulo",
        estado: "SP",
      });

      repository.addAtendimento({
        id: "ev-p1",
        clinicaId: clinica.id,
        tipoCuidado: "CONSULTA",
        dataHora: "2026-10-05T14:00:00.000Z",
        status: "PENDENTE",
        recorrencia: "NENHUMA",
        descricao: null,
        pet: { id: "pet-1", nome: "Thor", especie: "Cachorro", raca: null },
        tutor: { id: "tutor-1", nome: "Lucas", email: "lucas@email.com" },
      });

      repository.addAtendimento({
        id: "ev-c1",
        clinicaId: clinica.id,
        tipoCuidado: "VACINA",
        dataHora: "2026-09-01T10:00:00.000Z",
        status: "CONCLUIDO",
        recorrencia: "NENHUMA",
        descricao: null,
        pet: { id: "pet-2", nome: "Mel", especie: "Gato", raca: null },
        tutor: { id: "tutor-2", nome: "Bia", email: "bia@email.com" },
      });

      const resumo = await service.getResumoGestao(clinica.id);
      expect(resumo.totalAtendimentos).toBe(2);
      expect(resumo.pendentes).toBe(1);
      expect(resumo.concluidos).toBe(1);
      expect(resumo.cancelados).toBe(0);
      expect(resumo.proximosAtendimentos).toHaveLength(1);
      expect(resumo.proximosAtendimentos[0].id).toBe("ev-p1");
    });
  });
});

