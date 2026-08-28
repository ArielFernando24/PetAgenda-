# PetAgenda

O **PetAgenda** é uma aplicação para centralizar a rotina de cuidados dos animais, ajudando tutores a organizar vacinas, medicamentos, banhos, consultas e outros compromissos recorrentes.

## Problema

Tutores frequentemente dependem de alarmes, calendários genéricos e conversas espalhadas, o que aumenta o risco de esquecer cuidados importantes dos pets.

## Proposta de valor

Oferecer uma agenda centralizada por pet, com lembretes, histórico de cuidados e uma futura conexão com prestadores de serviços não emergenciais.

## Público inicial

- Tutores de pets.
- Pet shops.
- Pequenos prestadores autônomos.

## Persona principal

Mariana, 29 anos, é tutora de dois pets, trabalha em horário comercial e usa principalmente o celular. Ela precisa de uma agenda simples, separada por pet, com lembretes antecipados e histórico dos cuidados realizados.

## Critérios do MVP

1. Resolver diretamente o problema de esquecimento e organização dos cuidados.
2. Ser demonstrável de ponta a ponta dentro das sete semanas da disciplina.
3. Poder ser validado com tutores sem depender de pagamento integrado ou de pet shops reais.

## Escopo do MVP

- US01 — Cadastro de Tutor.
- US02 — Cadastro de Pets.
- US03 — Agenda de Cuidados e Compromissos.
- US04 — Lembretes e Notificações Simuladas.
- US05 — Histórico de Cuidados Realizados.

As US06 a US10 ficam planejadas para fases posteriores e monetização.

## Hipótese de monetização

- **Freemium Tutor:** um pet e histórico limitado.
- **Tutor Premium:** pets ilimitados, histórico vitalício, exportação em PDF e alertas avançados; hipótese inicial de R$ 9,90/mês.
- **Parceiro Pro:** perfil destacado, painel de agendamentos e métricas; hipótese inicial de R$ 49,90/mês.

## Stack técnica

- Backend: Node.js com TypeScript.
- Framework HTTP: Express.
- Validação: Zod.
- Testes: Jest e Supertest.
- Banco de dados: PostgreSQL com Prisma proposto no plano do backend; integração pendente da modelagem da US01.
- Frontend: pendente de confirmação da equipe.

## Incremento implementado: US02 — Cadastro de Pets

O backend da US02 possui cadastro, listagem, consulta, atualização e remoção de pets. Todas as operações são limitadas ao tutor autenticado e os dados de entrada são validados antes de chegar às regras de negócio.

Campos atuais: `nome`, `especie`, `raca`, `sexo` e `dataNascimento`.

Enquanto a US01 e o schema Prisma são desenvolvidos em paralelo, o incremento usa armazenamento em memória e um cabeçalho temporário `x-tutor-id`. Os dados são apagados ao reiniciar a aplicação. A decisão e os pontos de integração estão registrados em [ADR 0001](docs/adr/0001-us02-modulo-isolado.md).

### Rotas

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/health` | Verificar se a API está ativa |
| `POST` | `/api/pets` | Cadastrar um pet |
| `GET` | `/api/pets` | Listar os pets do tutor |
| `GET` | `/api/pets/:id` | Consultar um pet do tutor |
| `PUT` | `/api/pets/:id` | Atualizar dados de um pet |
| `DELETE` | `/api/pets/:id` | Remover um pet |

### Execução local

Pré-requisitos: Node.js 20 ou superior e pnpm.

```bash
pnpm install
pnpm dev
```

A API inicia em `http://localhost:3000`. Para testar a US02 antes da integração do JWT, envie um UUID de tutor no cabeçalho `x-tutor-id`:

```bash
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -H "x-tutor-id: 00000000-0000-4000-8000-000000000001" \
  -d '{"nome":"Luna","especie":"Cachorro","raca":"SRD","sexo":"FEMEA","dataNascimento":"2022-05-10"}'
```

### Verificação

```bash
pnpm typecheck
pnpm test
pnpm build
```

O servidor bloqueia o uso da autenticação temporária em produção. A US01 deverá substituir esse adaptador por um middleware JWT que preencha `req.auth.tutorId`.

## Evidências

- [Trello](https://trello.com/b/L9EDbail/meu-quadro-do-trello)
- [Protótipo no Figma](https://www.figma.com/design/zoITse6XFyAo9WH8bKd7kW/PetAgenda-%E2%80%94-Prot%C3%B3tipo-MVP)
- [Repositório atual](https://github.com/ArielFernando24/PetAgenda-)

## Situação atual

- Visão do produto definida.
- Backlog com dez histórias de usuário.
- Persona e critérios do MVP documentados.
- Protótipo registrado como 90% concluído no formulário da equipe.
- Estrutura inicial do backend implementada.
- US02 implementada com validação, isolamento por tutor e testes automatizados.
- Persistência Prisma e autenticação JWT aguardam a integração com a US01/modelagem.
