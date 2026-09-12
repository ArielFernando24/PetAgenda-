import { AtendimentoNotFoundError, ClinicaNotFoundError } from "../domain/clinica.errors";
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
import type { ClinicaRepository } from "./clinica.repository";

export class ClinicaService {
  constructor(private readonly repository: ClinicaRepository) {}

  async create(data: CreateClinicaData): Promise<Clinica> {
    return this.repository.create(data);
  }

  async list(filter?: ListClinicasFilter): Promise<Clinica[]> {
    return this.repository.findAll(filter);
  }

  async getById(id: string): Promise<Clinica> {
    const clinica = await this.repository.findById(id);
    if (!clinica) throw new ClinicaNotFoundError();
    return clinica;
  }

  async update(id: string, data: UpdateClinicaData): Promise<Clinica> {
    const updated = await this.repository.update(id, data);
    if (!updated) throw new ClinicaNotFoundError();
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new ClinicaNotFoundError();
  }

  async listAtendimentos(
    clinicaId: string,
    filter?: ListAtendimentosFilter,
  ): Promise<AtendimentoClinica[]> {
    const clinica = await this.repository.findById(clinicaId);
    if (!clinica) throw new ClinicaNotFoundError();
    return this.repository.findAtendimentos(clinicaId, filter);
  }

  async updateAtendimento(
    clinicaId: string,
    eventoId: string,
    data: UpdateAtendimentoData,
  ): Promise<AtendimentoClinica> {
    const clinica = await this.repository.findById(clinicaId);
    if (!clinica) throw new ClinicaNotFoundError();

    const updated = await this.repository.updateAtendimento(clinicaId, eventoId, data);
    if (!updated) throw new AtendimentoNotFoundError();
    return updated;
  }

  async getResumoGestao(clinicaId: string): Promise<ResumoGestaoClinica> {
    const clinica = await this.repository.findById(clinicaId);
    if (!clinica) throw new ClinicaNotFoundError();
    return this.repository.getResumoGestao(clinicaId);
  }
}

