import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema } from '../schemas/auth.schema';

const router = Router();

// POST /api/auth/login - Login de tutor gerando token JWT (Público)
router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));

export default router;
