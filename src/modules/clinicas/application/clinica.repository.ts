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

export interface ClinicaRepository {
  create(data: CreateClinicaData): Promise<Clinica>;
  findAll(filter?: ListClinicasFilter): Promise<Clinica[]>;
  findById(id: string): Promise<Clinica | null>;
  update(id: string, data: UpdateClinicaData): Promise<Clinica | null>;
  delete(id: string): Promise<boolean>;

  findAtendimentos(clinicaId: string, filter?: ListAtendimentosFilter): Promise<AtendimentoClinica[]>;
  findAtendimentoById(clinicaId: string, eventoId: string): Promise<AtendimentoClinica | null>;
  updateAtendimento(
    clinicaId: string,
    eventoId: string,
    data: UpdateAtendimentoData,
  ): Promise<AtendimentoClinica | null>;
  getResumoGestao(clinicaId: string): Promise<ResumoGestaoClinica>;
}

