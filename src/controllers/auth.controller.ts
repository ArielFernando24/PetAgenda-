import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        status: 'success',
        message: 'Login realizado com sucesso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.forgotPassword(req.body.email);
      res.status(200).json({
        status: 'success',
        message: 'Se o e-mail existir, você receberá instruções para redefinir sua senha.',
      });
    } catch (error) {
      next(error);
    }
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resetPassword(req.body);
      res.status(200).json({
        status: 'success',
        message: 'Senha redefinida com sucesso. Faça login com sua nova senha.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
