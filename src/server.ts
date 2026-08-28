import { createApp } from "./app";

if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEV_AUTH !== "true") {
  throw new Error(
    "A autenticacao temporaria da US02 nao pode ser usada em producao. Integre o JWT da US01.",
  );
}

const port = Number(process.env.PORT ?? 3000);

createApp().listen(port, () => {
  console.log(`PetAgenda API executando em http://localhost:${port}`);
});
