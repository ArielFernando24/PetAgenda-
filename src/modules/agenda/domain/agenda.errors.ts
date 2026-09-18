export class EventoNotFoundError extends Error {
  constructor() {
    super("Evento nao encontrado para o tutor autenticado.");
    this.name = "EventoNotFoundError";
  }
}

export class PetForbiddenOrNotFoundError extends Error {
  constructor() {
    super("Pet nao encontrado ou nao pertence ao tutor autenticado.");
    this.name = "PetForbiddenOrNotFoundError";
  }
}
