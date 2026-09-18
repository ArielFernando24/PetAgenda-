export class PetNotFoundError extends Error {
  constructor() {
    super("Pet nao encontrado para o tutor autenticado.");
    this.name = "PetNotFoundError";
  }
}
