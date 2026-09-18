import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schema';
import { authRateLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

// POST /api/auth/login - Login de tutor gerando token JWT (Público)
router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));

// POST /api/auth/forgot-password - Solicitação de recuperação de senha (Público com rate-limit)
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), (req, res, next) => authController.forgotPassword(req, res, next));

// POST /api/auth/reset-password - Redefinição de senha e invalidação de token (Público com rate-limit)
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), (req, res, next) => authController.resetPassword(req, res, next));

export default router;

