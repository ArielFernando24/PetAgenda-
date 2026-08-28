import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const tutorIdSchema = z.string().uuid();

/**
 * Adaptador temporario para a US02 funcionar antes da conclusao da US01.
 * O middleware definitivo de JWT deve apenas preencher req.auth.tutorId.
 */
export function developmentTutorAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const parsedTutorId = tutorIdSchema.safeParse(req.header("x-tutor-id"));

  if (!parsedTutorId.success) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Informe um tutor valido no cabecalho x-tutor-id.",
      },
    });
    return;
  }

  req.auth = { tutorId: parsedTutorId.data };
  next();
}
