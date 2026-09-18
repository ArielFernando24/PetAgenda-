import type { NextFunction, Request, Response } from "express";
import type { ClinicaService } from "../application/clinica.service";
import {
  atendimentoParamSchema,
  clinicaIdParamSchema,
  createClinicaSchema,
  listAtendimentosQuerySchema,
  listClinicasQuerySchema,
  updateAtendimentoSchema,
  updateClinicaSchema,
} from "./clinica.schemas";

export class ClinicaController {
  constructor(private readonly service: ClinicaService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createClinicaSchema.parse(req.body);
      const clinica = await this.service.create(data);
      res.status(201).json({ data: clinica });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = listClinicasQuerySchema.parse(req.query);
      const clinicas = await this.service.list(filter);
      res.status(200).json({ data: clinicas });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = clinicaIdParamSchema.parse(req.params);
      const clinica = await this.service.getById(id);
      res.status(200).json({ data: clinica });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = clinicaIdParamSchema.parse(req.params);
      const data = updateClinicaSchema.parse(req.body);
      const clinica = await this.service.update(id, data);
      res.status(200).json({ data: clinica });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = clinicaIdParamSchema.parse(req.params);
      await this.service.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  listAtendimentos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = clinicaIdParamSchema.parse(req.params);
      const filter = listAtendimentosQuerySchema.parse(req.query);
      const atendimentos = await this.service.listAtendimentos(id, filter);
      res.status(200).json({ data: atendimentos });
    } catch (error) {
      next(error);
    }
  };

  updateAtendimento = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, eventoId } = atendimentoParamSchema.parse(req.params);
      const data = updateAtendimentoSchema.parse(req.body);
      const updated = await this.service.updateAtendimento(id, eventoId, data);
      res.status(200).json({ data: updated });
    } catch (error) {
      next(error);
    }
  };

  getResumoGestao = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = clinicaIdParamSchema.parse(req.params);
      const resumo = await this.service.getResumoGestao(id);
      res.status(200).json({ data: resumo });
    } catch (error) {
      next(error);
    }
  };
}

