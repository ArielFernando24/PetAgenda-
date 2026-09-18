import type { RequestHandler } from 'express';
import { prisma } from '../../config/prisma';
import { authMiddleware } from '../../middlewares/auth.middleware';

/** Reutiliza o JWT da US01 e adapta seu contexto ao dominio da US02. */
export const petTutorAuth: RequestHandler = (req, res, next) => {
  authMiddleware(req, res, (error?: unknown) => {
    if (error) { next(error); return; }
    const tutorId = req.user?.tutor_id;
    if (!tutorId) { res.status(401).json({ message: 'Tutor nao autenticado.' }); return; }
    void prisma.tutor.findUnique({ where: { id: tutorId }, select: { id: true, tokenVersion: true } })
      .then(tutor => {
        if (!tutor) { res.status(401).json({ message: 'Tutor nao encontrado. Entre novamente.' }); return; }
        if (req.user?.token_version !== undefined && tutor.tokenVersion !== undefined && req.user.token_version !== tutor.tokenVersion) {
          res.status(401).json({ status: 'error', message: 'Sessão revogada. Faça login novamente.' });
          return;
        }
        req.auth = { tutorId: tutor.id };
        next();
      })
      .catch(next);
  });
};
