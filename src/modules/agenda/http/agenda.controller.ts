import type { NextFunction, Request, Response } from "express";
import type { AgendaService } from "../application/agenda.service";
import {
  createEventoSchema,
  eventoIdParamSchema,
  listEventoQuerySchema,
  updateEventoSchema,
} from "./agenda.schemas";

function tutorIdFrom(req: Request): string {
  if (!req.auth) throw new Error("Middleware de autenticacao nao configurado.");
  return req.auth.tutorId;
}

export class AgendaController {
  constructor(private readonly service: AgendaService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createEventoSchema.parse(req.body);
      const evento = await this.service.create(tutorIdFrom(req), data);
      res.status(201).json({ data: evento });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = listEventoQuerySchema.parse(req.query);
      const eventos = await this.service.list(tutorIdFrom(req), filter);
      res.status(200).json({ data: eventos });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = eventoIdParamSchema.parse(req.params);
      const evento = await this.service.getById(tutorIdFrom(req), id);
      res.status(200).json({ data: evento });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = eventoIdParamSchema.parse(req.params);
      const data = updateEventoSchema.parse(req.body);
      const evento = await this.service.update(tutorIdFrom(req), id, data);
      res.status(200).json({ data: evento });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = eventoIdParamSchema.parse(req.params);
      await this.service.delete(tutorIdFrom(req), id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
