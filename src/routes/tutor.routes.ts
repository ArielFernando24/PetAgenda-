import { Router } from 'express';
import { tutorController } from '../controllers/tutor.controller';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createTutorSchema, updateTutorSchema } from '../schemas/tutor.schema';

const router = Router();

// POST /api/tutores - Cadastro de novo tutor (Público)
router.post('/', validate(createTutorSchema), (req, res, next) => tutorController.create(req, res, next));

// GET /api/tutores/me - Perfil do tutor logado (Protegido por JWT)
router.get('/me', authMiddleware, (req, res, next) => tutorController.getMe(req, res, next));

// PUT /api/tutores/me - Atualização de perfil do tutor logado (Protegido por JWT)
router.put('/me', authMiddleware, validate(updateTutorSchema), (req, res, next) => tutorController.updateMe(req, res, next));

export default router;
