import express, { type RequestHandler } from "express";
import type { PetRepository } from "./modules/pets/application/pet.repository";
import { PetService } from "./modules/pets/application/pet.service";
import { createPetRouter } from "./modules/pets/http/pet.routes";
import { InMemoryPetRepository } from "./modules/pets/infrastructure/in-memory-pet.repository";
import { developmentTutorAuth } from "./shared/auth/development-auth.middleware";
import { appErrorMiddleware } from "./shared/http/app-error.middleware";

interface AppOptions {
  petRepository?: PetRepository;
  authenticate?: RequestHandler;
}

export function createApp(options: AppOptions = {}) {
  const app = express();
  const repository = options.petRepository ?? new InMemoryPetRepository();
  const service = new PetService(repository);
  const authenticate = options.authenticate ?? developmentTutorAuth;

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/pets", createPetRouter(service, authenticate));

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "Rota nao encontrada.",
      },
    });
  });

  app.use(appErrorMiddleware);
  return app;
}
