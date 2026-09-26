import { Router, type RequestHandler } from 'express';
import { reportsController } from './reports.controller';
import { petTutorAuth } from '../../../shared/auth/pet-tutor-auth.middleware';

export function createReportsRouter(auth: RequestHandler = petTutorAuth): Router {
  const router = Router();

  // Exportação CSV (TASK-08.1)
  router.get('/agenda/csv', auth, reportsController.exportCsv);
  router.get('/csv', auth, reportsController.exportCsv);

  // Exportação PDF (TASK-08.2)
  router.get('/agenda/pdf', auth, reportsController.exportPdf);
  router.get('/pdf', auth, reportsController.exportPdf);

  return router;
}
