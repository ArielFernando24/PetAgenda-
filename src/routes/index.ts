import { Router } from 'express';
import tutorRoutes from './tutor.routes';
import authRoutes from './auth.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'PetAgenda API está online',
    timestamp: new Date().toISOString(),
  });
});

// Rotas da aplicação
router.use('/tutores', tutorRoutes);
router.use('/auth', authRoutes);

export default router;
