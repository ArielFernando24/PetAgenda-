import type { PrismaClient, StatusEvento } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import type { ClinicaRepository } from "../application/clinica.repository";
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

function toAtendimentoClinica(ev: any): AtendimentoClinica {
  return {
    id: ev.id,
    clinicaId: ev.clinicaId!,
    tipoCuidado: ev.tipoCuidado,
    dataHora: ev.dataHora.toISOString(),
    status: ev.status,
    recorrencia: ev.recorrencia,
    descricao: ev.descricao,
    pet: {
      id: ev.pet.id,
      nome: ev.pet.nome,
      especie: ev.pet.especie,
      raca: ev.pet.raca,
    },
    tutor: {
      id: ev.pet.tutor.id,
      nome: ev.pet.tutor.nome,
      email: ev.pet.tutor.email,
    },
  };
}

export class PrismaClinicaRepository implements ClinicaRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  async create(data: CreateClinicaData): Promise<Clinica> {
    const clinica = await this.client.clinica.create({
      data: {
        nome: data.nome,
        telefone: data.telefone,
        email: data.email ?? null,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        horarioFuncionamento: data.horarioFuncionamento ?? null,
        servicos: data.servicos ?? [],
        descricao: data.descricao ?? null,
      },
    });

    return clinica;
  }

  async findAll(filter?: ListClinicasFilter): Promise<Clinica[]> {
    const where: Record<string, unknown> = {};

    if (filter?.busca) {
      where.OR = [
        { nome: { contains: filter.busca, mode: "insensitive" } },
        { endereco: { contains: filter.busca, mode: "insensitive" } },
        { descricao: { contains: filter.busca, mode: "insensitive" } },
      ];
    }

    if (filter?.cidade) {
      where.cidade = { equals: filter.cidade, mode: "insensitive" };
    }

    if (filter?.estado) {
      where.estado = { equals: filter.estado.toUpperCase() };
    }

    if (filter?.servico) {
      where.servicos = { has: filter.servico };
    }

    const clinicas = await this.client.clinica.findMany({
      where,
      orderBy: [{ nome: "asc" }, { id: "asc" }],
    });

    return clinicas;
  }

  async findById(id: string): Promise<Clinica | null> {
    const clinica = await this.client.clinica.findUnique({
      where: { id },
    });

    return clinica;
  }

  async update(id: string, data: UpdateClinicaData): Promise<Clinica | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated = await this.client.clinica.update({
      where: { id },
      data: {
        nome: data.nome,
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        horarioFuncionamento: data.horarioFuncionamento,
        servicos: data.servicos,
        descricao: data.descricao,
      },
    });

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;

    await this.client.clinica.delete({ where: { id } });
    return true;
  }

  async findAtendimentos(
    clinicaId: string,
    filter?: ListAtendimentosFilter,
  ): Promise<AtendimentoClinica[]> {
    const eventos = await this.client.evento.findMany({
      where: {
        clinicaId,
        ...(filter?.status ? { status: filter.status as StatusEvento } : {}),
        ...(filter?.dataInicio || filter?.dataFim
          ? {
              dataHora: {
                ...(filter.dataInicio ? { gte: new Date(filter.dataInicio) } : {}),
                ...(filter.dataFim ? { lte: new Date(filter.dataFim) } : {}),
              },
            }
          : {}),
      },
      include: {
        pet: {
          include: {
            tutor: true,
          },
        },
      },
      orderBy: { dataHora: "asc" },
    });

    return eventos.map(toAtendimentoClinica);
  }

  async findAtendimentoById(
    clinicaId: string,
    eventoId: string,
  ): Promise<AtendimentoClinica | null> {
    const evento = await this.client.evento.findFirst({
      where: { id: eventoId, clinicaId },
      include: {
        pet: {
          include: {
            tutor: true,
          },
        },
      },
    });

    return evento ? toAtendimentoClinica(evento) : null;
  }

  async updateAtendimento(
    clinicaId: string,
    eventoId: string,
    data: UpdateAtendimentoData,
  ): Promise<AtendimentoClinica | null> {
    const existing = await this.findAtendimentoById(clinicaId, eventoId);
    if (!existing) return null;

    const updated = await this.client.evento.update({
      where: { id: eventoId },
      data: {
        status: data.status ? (data.status as StatusEvento) : undefined,
        descricao: data.descricao,
      },
      include: {
        pet: {
          include: {
            tutor: true,
          },
        },
      },
    });

    return toAtendimentoClinica(updated);
  }

  async getResumoGestao(clinicaId: string): Promise<ResumoGestaoClinica> {
    const [total, pendentes, concluidos, cancelados, proximos] = await Promise.all([
      this.client.evento.count({ where: { clinicaId } }),
      this.client.evento.count({ where: { clinicaId, status: "PENDENTE" } }),
      this.client.evento.count({ where: { clinicaId, status: "CONCLUIDO" } }),
      this.client.evento.count({ where: { clinicaId, status: "CANCELADO" } }),
      this.client.evento.findMany({
        where: { clinicaId, status: "PENDENTE" },
        include: {
          pet: {
            include: {
              tutor: true,
            },
          },
        },
        orderBy: { dataHora: "asc" },
        take: 5,
      }),
    ]);

    return {
      totalAtendimentos: total,
      pendentes,
      concluidos,
      cancelados,
      proximosAtendimentos: proximos.map(toAtendimentoClinica),
    };
  }
}

