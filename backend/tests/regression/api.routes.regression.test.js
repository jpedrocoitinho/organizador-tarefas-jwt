jest.mock("../../src/repositories/user.repo", () => ({
  findByEmail: jest.fn(),
  createUser: jest.fn(),
  findById: jest.fn()
}));

jest.mock("../../src/repositories/task.repo", () => ({
  list: jest.fn(),
  create: jest.fn(),
  markDone: jest.fn(),
  remove: jest.fn()
}));

jest.mock("../../src/utils/password", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn()
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../src/app");
const userRepo = require("../../src/repositories/user.repo");
const taskRepo = require("../../src/repositories/task.repo");
const passwordUtils = require("../../src/utils/password");

describe("regressao HTTP da API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "segredo_teste";
    process.env.JWT_EXPIRES_IN = "2h";
  });

  function authHeader(payload = { id: 1, email: "ana@email.com" }) {
    return `Bearer ${jwt.sign(payload, process.env.JWT_SECRET)}`;
  }

  test("GET /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, app: "organizador-tarefas-jwt" });
  });

  test("POST /auth/register cria usuario", async () => {
    userRepo.findByEmail.mockResolvedValueOnce(undefined);
    passwordUtils.hashPassword.mockResolvedValueOnce("hash");
    userRepo.createUser.mockResolvedValueOnce(3);
    const res = await request(app).post("/auth/register").send({
      name: "Ana",
      email: "ana@email.com",
      password: "123456"
    });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 3, message: "Usuário criado" });
    expect(res.body).not.toHaveProperty("password");
  });

  test("POST /auth/register rejeita campos ausentes", async () => {
    const res = await request(app).post("/auth/register").send({ name: "Ana" });
    expect(res.status).toBe(400);
  });

  test("POST /auth/register rejeita e-mail existente", async () => {
    userRepo.findByEmail.mockResolvedValueOnce({ id: 1 });
    const res = await request(app).post("/auth/register").send({
      name: "Ana",
      email: "ana@email.com",
      password: "123456"
    });
    expect(res.status).toBe(409);
  });

  test("POST /auth/login retorna token", async () => {
    userRepo.findByEmail.mockResolvedValueOnce({
      id: 1,
      email: "ana@email.com",
      password_hash: "hash"
    });
    passwordUtils.comparePassword.mockResolvedValueOnce(true);
    const res = await request(app).post("/auth/login").send({
      email: "ana@email.com",
      password: "123456"
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
  });

  test("POST /auth/login rejeita senha invalida", async () => {
    userRepo.findByEmail.mockResolvedValueOnce({ password_hash: "hash" });
    passwordUtils.comparePassword.mockResolvedValueOnce(false);
    const res = await request(app).post("/auth/login").send({
      email: "ana@email.com",
      password: "errada"
    });
    expect(res.status).toBe(401);
  });

  test("GET /users/me exige token", async () => {
    const res = await request(app).get("/users/me");
    expect(res.status).toBe(401);
  });

  test("GET /users/me retorna usuario autenticado", async () => {
    userRepo.findById.mockResolvedValueOnce({ id: 1, name: "Ana", email: "ana@email.com" });
    const res = await request(app).get("/users/me").set("Authorization", authHeader());
    expect(res.status).toBe(200);
    expect(userRepo.findById).toHaveBeenCalledWith(1);
  });

  test("GET /tasks rejeita token invalido", async () => {
    const res = await request(app).get("/tasks").set("Authorization", "Bearer invalido");
    expect(res.status).toBe(401);
  });

  test("GET /tasks lista tarefas do usuario", async () => {
    taskRepo.list.mockResolvedValueOnce([{ id: 1, title: "Estudar" }]);
    const res = await request(app).get("/tasks").set("Authorization", authHeader({ id: 7 }));
    expect(res.status).toBe(200);
    expect(taskRepo.list).toHaveBeenCalledWith(7);
  });

  test("POST /tasks cria tarefa usando usuario do token", async () => {
    taskRepo.create.mockResolvedValueOnce(9);
    const body = { title: "Estudar Jest" };
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", authHeader({ id: 7 }))
      .send(body);
    expect(res.status).toBe(201);
    expect(taskRepo.create).toHaveBeenCalledWith(7, body);
  });

  test("POST /tasks rejeita tarefa sem titulo", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", authHeader())
      .send({ description: "Sem titulo" });
    expect(res.status).toBe(400);
  });

  test("PATCH /tasks/:id/done atualiza tarefa", async () => {
    taskRepo.markDone.mockResolvedValueOnce(1);
    const res = await request(app)
      .patch("/tasks/8/done")
      .set("Authorization", authHeader({ id: 7 }))
      .send({ done: true });
    expect(res.status).toBe(200);
    expect(taskRepo.markDone).toHaveBeenCalledWith(7, "8", true);
  });

  test("PATCH /tasks/:id/done retorna 404 para tarefa inexistente", async () => {
    taskRepo.markDone.mockResolvedValueOnce(0);
    const res = await request(app)
      .patch("/tasks/99/done")
      .set("Authorization", authHeader())
      .send({ done: true });
    expect(res.status).toBe(404);
  });

  test("DELETE /tasks/:id exclui tarefa", async () => {
    taskRepo.remove.mockResolvedValueOnce(1);
    const res = await request(app)
      .delete("/tasks/8")
      .set("Authorization", authHeader({ id: 7 }));
    expect(res.status).toBe(204);
    expect(taskRepo.remove).toHaveBeenCalledWith(7, "8");
  });

  test("DELETE /tasks/:id retorna 404 para tarefa inexistente", async () => {
    taskRepo.remove.mockResolvedValueOnce(0);
    const res = await request(app).delete("/tasks/99").set("Authorization", authHeader());
    expect(res.status).toBe(404);
  });
});
