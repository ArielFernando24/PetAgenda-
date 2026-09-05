import express, { type RequestHandler } from 'express';
import cors from 'cors';
import path from 'node:path';
import routes from './routes';
import { env } from './config/env';
import type { PetRepository } from './modules/pets/application/pet.repository';
import { PetService } from './modules/pets/application/pet.service';
import { createPetRouter } from './modules/pets/http/pet.routes';
import { PrismaPetRepository } from './modules/pets/infrastructure/prisma-pet.repository';
import { petTutorAuth } from './shared/auth/pet-tutor-auth.middleware';
import { appErrorMiddleware } from './shared/http/app-error.middleware';

interface AppOptions {
  petRepository?: PetRepository;
  authenticate?: RequestHandler;
}
export function createApp(options: AppOptions = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: env.CORS_ORIGINS, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
  app.use(express.json({ limit: '100kb' }));
  app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
  app.use('/api', routes);
  app.use('/api/pets', createPetRouter(
    new PetService(options.petRepository ?? new PrismaPetRepository()),
    options.authenticate ?? petTutorAuth,
  ));
  app.use(express.static(path.resolve(__dirname, '../public')));
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'ROUTE_NOT_FOUND', message: 'Rota nao encontrada.' } });
  });
  app.use(appErrorMiddleware);
  return app;
}
export default createApp();
