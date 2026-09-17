import { randomUUID } from "node:crypto";
import type {
  AtendimentoClinica,
  Clinica,
  CreateClinicaData,
  ListAtendimentosFilter,
  ListClinicasFilter,
  ResumoGestaoClinica,
  UpdateAtendimentoData,
  UpdateClinicaData,
} from "../domain/clinica";
import type { ClinicaRepository } from "../application/clinica.repository";

interface InMemoryClinicaRepositoryOptions {
  generateId?: () => string;
  now?: () => Date;
}

export class InMemoryClinicaRepository implements ClinicaRepository {
  private readonly clinicas = new Map<string, Clinica>();
  private readonly generateId: () => string;
  private readonly now: () => Date;

  constructor(options: InMemoryClinicaRepositoryOptions = {}) {
    this.generateId = options.generateId ?? randomUUID;
    this.now = options.now ?? (() => new Date());
  }

  async create(data: CreateClinicaData): Promise<Clinica> {
    const timestamp = this.now();
    const clinica: Clinica = {
      id: this.generateId(),
      nome: data.nome,
      telefone: data.telefone,
      email: data.email ?? null,
      endereco: data.endereco,
      cidade: data.cidade,
      estado: data.estado,
      horarioFuncionamento: data.horarioFuncionamento ?? null,
      servicos: data.servicos ? [...data.servicos] : [],
      descricao: data.descricao ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.clinicas.set(clinica.id, clinica);
    return { ...clinica };
  }

  async findAll(filter?: ListClinicasFilter): Promise<Clinica[]> {
    let result = [...this.clinicas.values()];

    if (filter?.busca) {
      const q = filter.busca.toLowerCase();
      result = result.filter(
        (c) =>
          c.nome.toLowerCase().includes(q) ||
          c.endereco.toLowerCase().includes(q) ||
          (c.descricao && c.descricao.toLowerCase().includes(q)),
      );
    }

    if (filter?.cidade) {
      const cidadeLower = filter.cidade.toLowerCase();
      result = result.filter((c) => c.cidade.toLowerCase() === cidadeLower);
    }

    if (filter?.estado) {
      const estadoUpper = filter.estado.toUpperCase();
      result = result.filter((c) => c.estado.toUpperCase() === estadoUpper);
    }

    if (filter?.servico) {
      const srvLower = filter.servico.toLowerCase();
      result = result.filter((c) =>
        c.servicos.some((s) => s.toLowerCase().includes(srvLower)),
      );
    }

    return result.map((c) => ({ ...c }));
  }

  async findById(id: string): Promise<Clinica | null> {
    const clinica = this.clinicas.get(id);
    return clinica ? { ...clinica } : null;
  }

  async update(id: string, data: UpdateClinicaData): Promise<Clinica | null> {
    const current = this.clinicas.get(id);
    if (!current) return null;

    const updated: Clinica = {
      ...current,
      ...data,
      email: data.email !== undefined ? data.email : current.email,
      horarioFuncionamento:
        data.horarioFuncionamento !== undefined
          ? data.horarioFuncionamento
          : current.horarioFuncionamento,
      descricao: data.descricao !== undefined ? data.descricao : current.descricao,
      servicos: data.servicos ? [...data.servicos] : current.servicos,
      updatedAt: this.now(),
    };

    this.clinicas.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.clinicas.delete(id);
  }

  private readonly atendimentos = new Map<string, AtendimentoClinica>();

  addAtendimento(atendimento: AtendimentoClinica): void {
    this.atendimentos.set(atendimento.id, { ...atendimento });
  }

  async findAtendimentos(
    clinicaId: string,
    filter?: ListAtendimentosFilter,
  ): Promise<AtendimentoClinica[]> {
    let list = [...this.atendimentos.values()].filter((a) => a.clinicaId === clinicaId);

    if (filter?.status) {
      const st = filter.status.toUpperCase();
      list = list.filter((a) => a.status.toUpperCase() === st);
    }

    if (filter?.dataInicio) {
      const inicio = new Date(filter.dataInicio).getTime();
      list = list.filter((a) => new Date(a.dataHora).getTime() >= inicio);
    }

    if (filter?.dataFim) {
      const fim = new Date(filter.dataFim).getTime();
      list = list.filter((a) => new Date(a.dataHora).getTime() <= fim);
    }

    return list
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
      .map((a) => ({ ...a }));
  }

  async findAtendimentoById(
    clinicaId: string,
    eventoId: string,
  ): Promise<AtendimentoClinica | null> {
    const item = this.atendimentos.get(eventoId);
    if (!item || item.clinicaId !== clinicaId) return null;
    return { ...item };
  }

  async updateAtendimento(
    clinicaId: string,
    eventoId: string,
    data: UpdateAtendimentoData,
  ): Promise<AtendimentoClinica | null> {
    const existing = await this.findAtendimentoById(clinicaId, eventoId);
    if (!existing) return null;

    const updated: AtendimentoClinica = {
      ...existing,
      status: data.status ? data.status.toUpperCase() : existing.status,
      descricao: data.descricao !== undefined ? data.descricao : existing.descricao,
    };

    this.atendimentos.set(eventoId, updated);
    return { ...updated };
  }

  async getResumoGestao(clinicaId: string): Promise<ResumoGestaoClinica> {
    const todos = [...this.atendimentos.values()].filter((a) => a.clinicaId === clinicaId);
    const pendentes = todos.filter((a) => a.status.toUpperCase() === "PENDENTE").length;
    const concluidos = todos.filter((a) => a.status.toUpperCase() === "CONCLUIDO").length;
    const cancelados = todos.filter((a) => a.status.toUpperCase() === "CANCELADO").length;

    const proximos = todos
      .filter((a) => a.status.toUpperCase() === "PENDENTE")
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
      .slice(0, 5)
      .map((a) => ({ ...a }));

    return {
      totalAtendimentos: todos.length,
      pendentes,
      concluidos,
      cancelados,
      proximosAtendimentos: proximos,
    };
  }
}

