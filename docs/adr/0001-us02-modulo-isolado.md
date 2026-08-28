# ADR 0001: Implementar a US02 como modulo isolado

## Status

Aceita para o incremento inicial da US02.

## Contexto

A US01 (cadastro/autenticacao de tutor) e a modelagem do banco estao sendo desenvolvidas em paralelo por outro integrante. A US02 precisa avancar sem duplicar esse trabalho nem criar conflitos no futuro schema Prisma.

## Decisao

- Separar a US02 nas camadas de dominio, aplicacao, HTTP e infraestrutura.
- Exigir `tutorId` em toda operacao do repositorio de pets.
- Usar uma interface `PetRepository` como porta de persistencia.
- Entregar inicialmente um adaptador em memoria para demonstracao e testes.
- Usar temporariamente o cabecalho `x-tutor-id`; o JWT da US01 devera apenas preencher `req.auth.tutorId`.
- Bloquear a inicializacao em producao enquanto a autenticacao temporaria nao for explicitamente substituida ou autorizada para uma demonstracao controlada.

## Consequencias

### Positivas

- US01 e US02 podem ser desenvolvidas em paralelo.
- A regra de isolamento por tutor fica testavel desde o inicio.
- O adaptador Prisma pode ser adicionado sem reescrever as regras ou os endpoints.

### Pendencias de integracao

- Substituir `developmentTutorAuth` pelo middleware JWT da US01.
- Criar o adaptador Prisma usando o schema acordado pela equipe.
- Decidir se `sexo` sera enum no banco; o backlog atual usa `MACHO`, `FEMEA` e `NAO_INFORMADO`.
