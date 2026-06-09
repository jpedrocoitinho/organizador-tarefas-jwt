jest.mock("../../../src/repositories/user.repo", () => ({
  findByEmail: jest.fn(),
  createUser: jest.fn()
}));

jest.mock("../../../src/utils/password", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn()
}));

const jwt = require("jsonwebtoken");
const repo = require("../../../src/repositories/user.repo");
const passwordUtils = require("../../../src/utils/password");
const controller = require("../../../src/controllers/auth.controller");
const { createMockResponse } = require("../../helpers/mockResponse");

describe("controllers/auth.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "segredo_teste";
    process.env.JWT_EXPIRES_IN = "2h";
  });

  test("register valida campos obrigatorios", async () => {
    const req = { body: { name: "Ana" } };
    const res = createMockResponse();
    const next = jest.fn();

    await controller.register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(repo.findByEmail).not.toHaveBeenCalled();
  });

  test("register retorna 409 para e-mail existente", async () => {
    repo.findByEmail.mockResolvedValueOnce({ id: 1 });
    const req = { body: { name: "Ana", email: "ana@email.com", password: "123456" } };
    const res = createMockResponse();

    await controller.register(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(repo.createUser).not.toHaveBeenCalled();
  });

  test("register cria usuario e retorna 201", async () => {
    repo.findByEmail.mockResolvedValueOnce(undefined);
    passwordUtils.hashPassword.mockResolvedValueOnce("hash");
    repo.createUser.mockResolvedValueOnce(3);
    const req = { body: { name: "Ana", email: "ana@email.com", password: "123456" } };
    const res = createMockResponse();

    await controller.register(req, res, jest.fn());

    expect(passwordUtils.hashPassword).toHaveBeenCalledWith("123456");
    expect(repo.createUser).toHaveBeenCalledWith("Ana", "ana@email.com", "hash");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 3, message: "Usuário criado" });
  });

  test("login valida campos obrigatorios", async () => {
    const res = createMockResponse();

    await controller.login({ body: { email: "ana@email.com" } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("login retorna 401 para usuario inexistente", async () => {
    repo.findByEmail.mockResolvedValueOnce(undefined);
    const res = createMockResponse();

    await controller.login(
      { body: { email: "ana@email.com", password: "errada" } },
      res,
      jest.fn()
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(passwordUtils.comparePassword).not.toHaveBeenCalled();
  });

  test("login retorna 401 para senha incorreta", async () => {
    repo.findByEmail.mockResolvedValueOnce({ password_hash: "hash" });
    passwordUtils.comparePassword.mockResolvedValueOnce(false);
    const res = createMockResponse();

    await controller.login(
      { body: { email: "ana@email.com", password: "errada" } },
      res,
      jest.fn()
    );

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("login retorna token para credenciais validas", async () => {
    repo.findByEmail.mockResolvedValueOnce({
      id: 2,
      email: "ana@email.com",
      password_hash: "hash"
    });
    passwordUtils.comparePassword.mockResolvedValueOnce(true);
    const res = createMockResponse();

    await controller.login(
      { body: { email: "ana@email.com", password: "123456" } },
      res,
      jest.fn()
    );

    const { accessToken } = res.body;
    expect(jwt.verify(accessToken, process.env.JWT_SECRET)).toMatchObject({ id: 2 });
  });

  test("encaminha erros inesperados para next", async () => {
    const error = new Error("falha");
    repo.findByEmail.mockRejectedValueOnce(error);
    const next = jest.fn();

    await controller.register(
      { body: { name: "Ana", email: "ana@email.com", password: "123456" } },
      createMockResponse(),
      next
    );

    expect(next).toHaveBeenCalledWith(error);
  });
});
