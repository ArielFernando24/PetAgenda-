import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { PetNotFoundError } from "../../modules/pets/domain/pet.errors";
import {
  EventoNotFoundError,
  PetForbiddenOrNotFoundError,
} from "../../modules/agenda/domain/agenda.errors";
import { AppError } from "../../middlewares/error.middleware";
import { Prisma } from "@prisma/client";

export const appErrorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ status: "error", message: error.message });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    res.status(409).json({ status: "error", message: "Registro ja cadastrado." });
    return;
  }
  if (error instanceof SyntaxError && "type" in error && error.type === "entity.parse.failed") {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "O corpo da requisicao deve conter um JSON valido.",
      },
    });
    return;
  }

  if (error instanceof Error && "type" in error && error.type === "entity.too.large") {
    res.status(413).json({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "O corpo da requisicao excede o limite permitido.",
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Os dados informados sao invalidos.",
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof PetNotFoundError || error instanceof PetForbiddenOrNotFoundError) {
    res.status(404).json({
      error: {
        code: "PET_NOT_FOUND",
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof EventoNotFoundError) {
    res.status(404).json({
      error: {
        code: "EVENTO_NOT_FOUND",
        message: error.message,
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Ocorreu um erro interno inesperado.",
    },
  });
};
