import express, { type RequestHandler } from 'express';
import cors from 'cors';
import path from 'node:path';
import routes from './routes';
import { env } from './config/env';
import type { PetRepository } from './modules/pets/application/pet.repository';
import { PetService } from './modules/pets/application/pet.service';
import { createPetRouter } from './modules/pets/http/pet.routes';
import { PrismaPetRepository } from './modules/pets/infrastructure/prisma-pet.repository';
import type { AgendaRepository } from './modules/agenda/application/agenda.repository';
import { AgendaService } from './modules/agenda/application/agenda.service';
import { createAgendaRouter } from './modules/agenda/http/agenda.routes';
import { PrismaAgendaRepository } from './modules/agenda/infrastructure/prisma-agenda.repository';
import { petTutorAuth } from './shared/auth/pet-tutor-auth.middleware';
import { appErrorMiddleware } from './shared/http/app-error.middleware';

interface AppOptions {
  petRepository?: PetRepository;
  agendaRepository?: AgendaRepository;
  authenticate?: RequestHandler;
}
export function createApp(options: AppOptions = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: env.CORS_ORIGINS, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
  app.use(express.json({ limit: '100kb' }));
  app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
  app.use('/api', routes);

  const petRepository = options.petRepository ?? new PrismaPetRepository();
  const agendaRepository = options.agendaRepository ?? new PrismaAgendaRepository();
  const authMiddleware = options.authenticate ?? petTutorAuth;

  app.use('/api/pets', createPetRouter(
    new PetService(petRepository),
    authMiddleware,
  ));
  app.use('/api/agenda', createAgendaRouter(
    new AgendaService(agendaRepository, petRepository),
    authMiddleware,
  ));
  app.use(express.static(path.resolve(__dirname, '../public')));
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'ROUTE_NOT_FOUND', message: 'Rota nao encontrada.' } });
  });
  app.use(appErrorMiddleware);
  return app;
}
export default createApp();
