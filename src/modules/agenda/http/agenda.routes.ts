import { Router, type RequestHandler } from "express";
import type { AgendaService } from "../application/agenda.service";
import { AgendaController } from "./agenda.controller";

export function createAgendaRouter(service: AgendaService, authenticate: RequestHandler): Router {
  const router = Router();
  const controller = new AgendaController(service);

  router.use(authenticate);
  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
