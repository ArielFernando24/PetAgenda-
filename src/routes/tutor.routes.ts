import { Router } from 'express';
import { tutorController } from '../controllers/tutor.controller';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createTutorSchema, updateTutorSchema } from '../schemas/tutor.schema';
import { avatarUploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();

// POST /api/tutores ou /api/users - Cadastro de novo tutor (Público)
router.post('/', validate(createTutorSchema), (req, res, next) => tutorController.create(req, res, next));

// GET /api/tutores/me ou /api/users/me - Perfil do tutor logado (Protegido por JWT)
router.get('/me', authMiddleware, (req, res, next) => tutorController.getMe(req, res, next));

// PUT /api/tutores/me ou /api/users/me - Atualização de perfil do tutor logado (Protegido por JWT)
router.put('/me', authMiddleware, validate(updateTutorSchema), (req, res, next) => tutorController.updateMe(req, res, next));

// POST /api/tutores/me/avatar ou /api/users/me/avatar - Upload de foto de perfil
router.post('/me/avatar', authMiddleware, avatarUploadMiddleware, (req, res, next) => tutorController.uploadAvatar(req, res, next));

// GET /api/tutores/me/avatar/presigned-url ou /api/users/me/avatar/presigned-url - URL pré-assinada para storage
router.get('/me/avatar/presigned-url', authMiddleware, (req, res, next) => tutorController.getPresignedAvatarUrl(req, res, next));

export default router;
