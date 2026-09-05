import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { z } from 'zod';

interface JwtPayload {
  tutor_id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      status: 'error',
      message: 'Token de autenticação não fornecido. Envie o header Authorization: Bearer <token>',
    });
    return;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      status: 'error',
      message: 'Formato de token inválido. Esperado: Bearer <token>',
    });
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload;

    if (!decoded || !z.string().uuid().safeParse(decoded.tutor_id).success) {
      res.status(401).json({
        status: 'error',
        message: 'Token inválido ou expirado',
      });
      return;
    }

    req.user = {
      tutor_id: decoded.tutor_id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Token inválido ou expirado',
    });
  }
};
