# Organizador de Tarefas JWT

API simples em Node.js + Express + MySQL com autenticação JWT.

Este projeto foi criado para os alunos implementarem testes unitários e testes de regressão tomando como referência o projeto `curadoria_jwt` já testado pelo professor.

## Domínio do sistema

O sistema permite:

- cadastrar usuário;
- fazer login;
- consultar o usuário autenticado;
- listar tarefas do usuário;
- criar tarefas;
- marcar tarefas como concluídas ou pendentes;
- excluir tarefas.

## Como executar

```bash
cd backend
cp .env.example .env
npm install
npm start
```

Antes de rodar a API, crie o banco executando o script:

```bash
mysql -u root -p < sql/schema.sql
```

## Rotas principais

### Público

```http
GET /health
POST /auth/register
POST /auth/login
```

### Protegido por JWT

Enviar o header:

```http
Authorization: Bearer SEU_TOKEN
```

Rotas protegidas:

```http
GET /users/me
GET /tasks
POST /tasks
PATCH /tasks/:id/done
DELETE /tasks/:id
```

## Exemplos de JSON

### Cadastro

```json
{
  "name": "Ana Silva",
  "email": "ana@email.com",
  "password": "123456"
}
```

### Login

```json
{
  "email": "ana@email.com",
  "password": "123456"
}
```

### Criar tarefa

```json
{
  "title": "Estudar testes com Jest",
  "description": "Criar testes unitários e de regressão",
  "due_date": "2026-06-20"
}
```

### Marcar tarefa como concluída

```json
{
  "done": true
}
```

## Observação didática

A pasta `tests` está propositalmente vazia. Os alunos devem criar os testes seguindo a organização usada no exemplo `curadoria_jwt`:

```text
tests/
  unit/
  regression/
```
