# Atividade: implementar testes unitários e testes de regressão

Este projeto é parecido com o `curadoria_jwt`, mas usa outro domínio: tarefas.

O objetivo é que você reproduza a estratégia de testes observada no exemplo.

## Parte 1 — Testes unitários

Crie testes para os seguintes arquivos:

```text
src/utils/password.js
src/middlewares/auth.middleware.js
src/repositories/user.repo.js
src/repositories/task.repo.js
src/controllers/auth.controller.js
src/controllers/users.controller.js
src/controllers/tasks.controller.js
```

### Casos mínimos esperados

#### password.js

- deve gerar hash diferente da senha original;
- deve validar senha correta;
- deve recusar senha incorreta.

#### auth.middleware.js

- deve retornar 401 quando não houver header Authorization;
- deve retornar 401 quando o formato do token estiver incorreto;
- deve retornar 401 quando o token for inválido;
- deve chamar `next()` quando o token for válido.

#### user.repo.js

- deve buscar usuário por e-mail;
- deve criar usuário;
- deve buscar usuário por id sem retornar `password_hash`.

#### task.repo.js

- deve listar tarefas do usuário;
- deve criar tarefa;
- deve marcar tarefa como concluída ou pendente;
- deve excluir tarefa;
- deve garantir que as operações usem `user_id` nos parâmetros.

#### controllers

- devem retornar os status corretos;
- devem chamar os repositórios corretos;
- devem tratar erros chamando `next(error)`;
- devem validar campos obrigatórios.

## Parte 2 — Testes de regressão HTTP

Use `supertest` para testar as rotas da API.

### Casos mínimos esperados

```text
GET /health
POST /auth/register
POST /auth/login
GET /users/me
GET /tasks
POST /tasks
PATCH /tasks/:id/done
DELETE /tasks/:id
```

Inclua também cenários de erro:

- cadastro com campos ausentes;
- cadastro com e-mail já existente;
- login com senha inválida;
- acesso sem token;
- acesso com token inválido;
- criação de tarefa sem título;
- atualização de tarefa inexistente;
- exclusão de tarefa inexistente.

## Comandos esperados

Depois de criar os testes, estes comandos devem funcionar:

```bash
npm test
npm run test:unit
npm run test:regression
npm run test:coverage
```

## Dica

Não use banco de dados real nos testes. Faça mocks dos repositórios ou do módulo `src/config/db.js`, como no exemplo `curadoria_jwt`.
