import { Router, type RequestHandler } from 'express';
import type { NotificationService } from '../application/notification.service';
import { NotificationController } from './notification.controller';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import { prisma } from '../../../config/prisma';
import { petTutorAuth } from '../../../shared/auth/pet-tutor-auth.middleware';

/**
 * Middleware de autenticação flexível para SSE
 * Aceita token via Header `Authorization: Bearer <token>` OU Query Param `?token=<token>`
 */
export const sseAuthMiddleware: RequestHandler = async (req, res, next) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    res.status(401).json({
      status: 'error',
      message: 'Token de autenticação não fornecido. Envie via Header Authorization ou Query Param ?token=...',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      tutor_id: string;
      email: string;
      token_version?: number;
    };

    if (!decoded || !decoded.tutor_id) {
      res.status(401).json({ status: 'error', message: 'Token inválido' });
      return;
    }

    const tutor = await prisma.tutor.findUnique({
      where: { id: decoded.tutor_id },
      select: { id: true, tokenVersion: true },
    });

    if (!tutor) {
      res.status(401).json({ status: 'error', message: 'Tutor não encontrado' });
      return;
    }

    if (
      decoded.token_version !== undefined &&
      tutor.tokenVersion !== undefined &&
      decoded.token_version !== tutor.tokenVersion
    ) {
      res.status(401).json({ status: 'error', message: 'Sessão revogada. Faça login novamente.' });
      return;
    }

    req.auth = { tutorId: tutor.id };
    req.user = { tutor_id: tutor.id, email: decoded.email, token_version: tutor.tokenVersion };
    next();
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Token inválido ou expirado' });
  }
};

export function createNotificationRouter(
  service: NotificationService,
  auth: RequestHandler = petTutorAuth,
): Router {
  const router = Router();
  const controller = new NotificationController(service);

  // Streaming SSE em tempo real (TASK-07.2)
  router.get('/stream', sseAuthMiddleware, controller.stream);

  // Endpoints REST de Gestão e Leitura (TASK-07.4)
  router.get('/', auth, controller.list);
  router.get('/unread-count', auth, controller.getUnreadCount);
  router.post('/', auth, controller.create);
  router.patch('/:id/read', auth, controller.markAsRead);
  router.post('/read-all', auth, controller.markAllAsRead);

  return router;
}
