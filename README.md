# PetAgenda API — integração US01 + US02 + US03

Backend do PetAgenda com cadastro e autenticação de tutor (US01), gestão de pets (US02) e agenda de cuidados/compromissos (US03).

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

- **US01 (Tutor & Autenticação)**: `GET /api/health`, `POST /api/tutores`, `POST /api/auth/login`, `GET/PUT /api/tutores/me`
- **US02 (Pets)**: CRUD em `/api/pets` (`GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id`)
- **US03 (Agenda & Cuidados)**: CRUD em `/api/agenda` (`GET /api/agenda`, `GET /api/agenda?petId=...`, `POST /api/agenda`, `GET /api/agenda/:id`, `PUT /api/agenda/:id`, `DELETE /api/agenda/:id`)
- **Módulo Clínicas**: `GET /api/clinicas` (com filtros por busca, cidade, estado e serviço), `GET /api/clinicas/:id` (perfil da clínica), `POST /api/clinicas`, `PUT /api/clinicas/:id`, `DELETE /api/clinicas/:id`

As rotas de pets, agenda e gestão de clínicas exigem `Authorization: Bearer <token>`. As rotas de consulta pública de clínicas (`GET /api/clinicas` e `GET /api/clinicas/:id`) permitem navegação rápida do catálogo.

## Persistência e validação

- A migration `20260905000100_add_pet` cria `pet`, o enum `PetSex`, a chave estrangeira `pet.tutor_id → tutor.id` e exclusão em cascata.
- A migration `20260910000100_add_evento` cria `evento`, os enums `TipoCuidado` (`VACINA`, `VERMIFUGO`, `BANHO_E_TOSA`, `CONSULTA`, `REMEDIO`), `Recorrencia` (`NENHUMA`, `SEMANAL`, `MENSAL`, `ANUAL`, `PERSONALIZADA`) e `StatusEvento` (`PENDENTE`, `CONCLUIDO`, `CANCELADO`), com chave estrangeira `evento.pet_id → pet.id` e exclusão em cascata.
- A migration `20260912140520_add_clinica` cria a tabela `clinica` com dados de perfil, contato e serviços, e adiciona a chave estrangeira opcional `evento.clinica_id → clinica.id`.

## Testes

```bash
npm run typecheck
npm test
npm run build
npm run prisma:deploy
```

Os testes cobrem US01, US02, US03 e Clínicas tanto em nível unitário quanto em testes de integração de ponta a ponta (E2E) com repositórios isolados e mocks. A validação contra PostgreSQL exige um banco de teste com a migration aplicada.

## Evidências

[Trello](https://trello.com/b/L9EDbail/meu-quadro-do-trello) · [Figma](https://www.figma.com/design/zoITse6XFyAo9WH8bKd7kW/PetAgenda-%E2%80%94-Protótipo-MVP) · [Repositório](https://github.com/ArielFernando24/PetAgenda-)
