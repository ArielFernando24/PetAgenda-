import { Router, type RequestHandler } from "express";
import type { ClinicaService } from "../application/clinica.service";
import { ClinicaController } from "./clinica.controller";

export function createClinicaRouter(
  service: ClinicaService,
  authMiddleware?: RequestHandler,
): Router {
  const router = Router();
  const controller = new ClinicaController(service);

  // Rotas de listagem e perfil de clínica
  router.get("/", controller.list);
  router.get("/:id", controller.getById);

  // Painel de Gestão da Clínica (atendimentos e resumo)
  if (authMiddleware) {
    router.get("/:id/atendimentos", authMiddleware, controller.listAtendimentos);
    router.get("/:id/resumo", authMiddleware, controller.getResumoGestao);
    router.put("/:id/atendimentos/:eventoId", authMiddleware, controller.updateAtendimento);
    router.post("/", authMiddleware, controller.create);
    router.put("/:id", authMiddleware, controller.update);
    router.delete("/:id", authMiddleware, controller.delete);
  } else {
    router.get("/:id/atendimentos", controller.listAtendimentos);
    router.get("/:id/resumo", controller.getResumoGestao);
    router.put("/:id/atendimentos/:eventoId", controller.updateAtendimento);
    router.post("/", controller.create);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.delete);
  }

  return router;
}
