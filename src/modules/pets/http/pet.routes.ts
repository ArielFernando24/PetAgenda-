import { Router, type RequestHandler } from "express";
import type { PetService } from "../application/pet.service";
import { PetController } from "./pet.controller";

export function createPetRouter(service: PetService, authenticate: RequestHandler): Router {
  const router = Router();
  const controller = new PetController(service);

  router.use(authenticate);
  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
