import { Request, Response, NextFunction } from 'express';
import { tutorService } from '../services/tutor.service';
import { AppError } from '../middlewares/error.middleware';

export class TutorController {
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tutor = await tutorService.createTutor(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Tutor cadastrado com sucesso',
        data: tutor,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.tutor_id) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const tutor = await tutorService.getTutorById(req.user.tutor_id);
      res.status(200).json({
        status: 'success',
        data: tutor,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.tutor_id) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const tutor = await tutorService.updateTutor(req.user.tutor_id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Perfil atualizado com sucesso',
        data: tutor,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const tutorController = new TutorController();
