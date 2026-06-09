const jwt = require("jsonwebtoken");
const { authRequired } = require("../../../src/middlewares/auth.middleware");
const { createMockResponse } = require("../../helpers/mockResponse");

describe("middlewares/auth.middleware", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "segredo_teste";
  });

  test("retorna 401 quando nao houver Authorization", () => {
    const req = { headers: {} };
    const res = createMockResponse();
    const next = jest.fn();

    authRequired(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token ausente" });
    expect(next).not.toHaveBeenCalled();
  });

  test("retorna 401 quando o formato do token estiver incorreto", () => {
    const req = { headers: { authorization: "Token valor" } };
    const res = createMockResponse();
    const next = jest.fn();

    authRequired(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Formato do token inválido" });
    expect(next).not.toHaveBeenCalled();
  });

  test("retorna 401 quando o token for invalido", () => {
    const req = { headers: { authorization: "Bearer token-invalido" } };
    const res = createMockResponse();
    const next = jest.fn();

    authRequired(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token inválido" });
    expect(next).not.toHaveBeenCalled();
  });

  test("preenche req.user e chama next quando o token for valido", () => {
    const token = jwt.sign({ id: 10, email: "teste@email.com" }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockResponse();
    const next = jest.fn();

    authRequired(req, res, next);

    expect(req.user).toMatchObject({ id: 10, email: "teste@email.com" });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
