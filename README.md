# PetAgenda API — integração US01 + US02

Backend do PetAgenda com cadastro e autenticação de tutor e cadastro de pets.

## Requisitos

Node.js 20+, PostgreSQL 14+ e npm.

## Configuração e execução

Copie `.env.example` para `.env`, preencha `DATABASE_URL` e configure `JWT_SECRET` com pelo menos 32 caracteres.

```bash
npm install
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

A API fica em `http://127.0.0.1:3000`. Use `docker compose up -d` para subir o PostgreSQL local. A tela de cadastro/login fica em `/` e a tela autenticada de pets em `/pets.html`.

## Rotas

`GET /api/health`, `POST /api/tutores`, `POST /api/auth/login`, `GET/PUT /api/tutores/me` e CRUD em `/api/pets`.

As rotas de pets exigem `Authorization: Bearer <token>`, validam a existência do tutor e filtram cada operação pelo tutor autenticado. O `tutorId` enviado no corpo é ignorado.

## Persistência e validação

A migration `20260905000100_add_pet` cria `pet`, o enum `PetSex`, a chave estrangeira `pet.tutor_id → tutor.id` e exclusão em cascata. `dataNascimento` é armazenada como `data_nascimento`. Nome e espécie são obrigatórios; raça é opcional; sexo aceita `MACHO`, `FEMEA` ou `NAO_INFORMADO`; a data deve ser `AAAA-MM-DD` e não pode ser futura.

## Testes

```bash
npm run typecheck
npm test
npm run build
npm run prisma:deploy
```

Os testes cobrem US01 e US02 com repositórios isolados e mocks. A validação contra PostgreSQL exige um banco de teste com a migration aplicada.

## Evidências

[Trello](https://trello.com/b/L9EDbail/meu-quadro-do-trello) · [Figma](https://www.figma.com/design/zoITse6XFyAo9WH8bKd7kW/PetAgenda-%E2%80%94-Protótipo-MVP) · [Repositório](https://github.com/ArielFernando24/PetAgenda-)
