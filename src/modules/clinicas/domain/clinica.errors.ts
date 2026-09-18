export class ClinicaNotFoundError extends Error {
  constructor() {
    super("Clinica veterinaria nao encontrada.");
    this.name = "ClinicaNotFoundError";
  }
}

export class AtendimentoNotFoundError extends Error {
  constructor() {
    super("Atendimento nao encontrado para esta clinica.");
    this.name = "AtendimentoNotFoundError";
  }
}

