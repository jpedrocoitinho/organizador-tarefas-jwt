# Organizador de Tarefas JWT

API REST para gerenciamento de tarefas pessoais, desenvolvida com Node.js,
Express, MySQL e autenticação JWT. O projeto inclui testes unitários e testes
de regressão HTTP com Jest e Supertest.

## Funcionalidades

- Cadastro e login de usuários.
- Proteção de rotas com JWT.
- Consulta do usuário autenticado.
- Listagem e criação de tarefas.
- Marcação de tarefas como concluídas ou pendentes.
- Exclusão de tarefas.
- Isolamento das tarefas pelo usuário autenticado.

## Tecnologias

- Node.js e Express
- MySQL e `mysql2`
- JSON Web Token (`jsonwebtoken`)
- BCrypt (`bcryptjs`)
- Jest e Supertest

## Arquitetura

O backend separa as responsabilidades em camadas:

```text
Rota -> Middleware JWT -> Controller -> Repository -> MySQL
```

```text
backend/
├── sql/                  # Script de criação do banco
├── src/
│   ├── config/           # Configuração do MySQL
│   ├── controllers/      # Regras de entrada e respostas HTTP
│   ├── middlewares/      # Autenticação e tratamento de erros
│   ├── repositories/     # Consultas SQL
│   ├── routes/           # Rotas da API
│   ├── utils/            # Funções auxiliares
│   ├── app.js            # Configuração do Express
│   └── server.js         # Inicialização do servidor
└── tests/
    ├── helpers/
    ├── unit/
    └── regression/
```

## Instalação

Entre na pasta do backend e instale as dependências:

```bash
cd backend
npm install
```

Copie `.env.example` para `.env` e ajuste as configurações:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=organizador_tarefas
JWT_SECRET=troque_este_segredo
JWT_EXPIRES_IN=1h
```

Crie o banco executando o arquivo [backend/sql/schema.sql](backend/sql/schema.sql).

Depois, inicie a API:

```bash
npm start
```

A API ficará disponível em `http://localhost:3001`.

## Rotas

Rotas públicas:

```http
GET  /health
POST /auth/register
POST /auth/login
```

Rotas protegidas:

```http
GET    /users/me
GET    /tasks
POST   /tasks
PATCH  /tasks/:id/done
DELETE /tasks/:id
```

Nas rotas protegidas, envie o token:

```http
Authorization: Bearer SEU_TOKEN
```

Exemplo de criação de tarefa:

```json
{
  "title": "Estudar testes com Jest",
  "description": "Criar testes unitários e de regressão",
  "due_date": "2026-06-20"
}
```

## Testes

Os testes utilizam mocks e não dependem de um banco MySQL em execução.

```bash
npm test
npm run test:unit
npm run test:regression
npm run test:coverage
```

A suíte possui 54 testes:

- 38 testes unitários.
- 16 testes de regressão HTTP.
- Cobertura geral de aproximadamente 95%.

O relatório HTML de cobertura é gerado em:

```text
backend/coverage/lcov-report/index.html
```

## Segurança

- Senhas são armazenadas como hashes BCrypt.
- Rotas privadas exigem JWT válido.
- O `user_id` usado nas tarefas vem do token, não do corpo da requisição.
- Consultas SQL utilizam parâmetros para reduzir riscos de SQL Injection.
