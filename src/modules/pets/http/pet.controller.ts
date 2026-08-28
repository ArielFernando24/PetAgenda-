import type { NextFunction, Request, Response } from "express";
import type { PetService } from "../application/pet.service";
import { createPetSchema, petIdParamSchema, updatePetSchema } from "./pet.schemas";

function tutorIdFrom(req: Request): string {
  if (!req.auth) throw new Error("Middleware de autenticacao nao configurado.");
  return req.auth.tutorId;
}

export class PetController {
  constructor(private readonly service: PetService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pet = await this.service.create(tutorIdFrom(req), createPetSchema.parse(req.body));
      res.status(201).json({ data: pet });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pets = await this.service.list(tutorIdFrom(req));
      res.status(200).json({ data: pets });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = petIdParamSchema.parse(req.params);
      const pet = await this.service.getById(tutorIdFrom(req), id);
      res.status(200).json({ data: pet });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = petIdParamSchema.parse(req.params);
      const pet = await this.service.update(
        tutorIdFrom(req),
        id,
        updatePetSchema.parse(req.body),
      );
      res.status(200).json({ data: pet });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = petIdParamSchema.parse(req.params);
      await this.service.delete(tutorIdFrom(req), id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
