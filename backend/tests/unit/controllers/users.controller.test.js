jest.mock("../../../src/repositories/user.repo", () => ({
  findById: jest.fn()
}));

const repo = require("../../../src/repositories/user.repo");
const controller = require("../../../src/controllers/users.controller");
const { createMockResponse } = require("../../helpers/mockResponse");

describe("controllers/users.controller", () => {
  beforeEach(() => jest.clearAllMocks());

  test("me retorna usuario autenticado", async () => {
    const user = { id: 5, name: "Ana", email: "ana@email.com" };
    repo.findById.mockResolvedValueOnce(user);
    const res = createMockResponse();

    await controller.me({ user: { id: 5 } }, res, jest.fn());

    expect(repo.findById).toHaveBeenCalledWith(5);
    expect(res.json).toHaveBeenCalledWith(user);
  });

  test("me retorna 404 quando usuario nao existir", async () => {
    repo.findById.mockResolvedValueOnce(undefined);
    const res = createMockResponse();

    await controller.me({ user: { id: 5 } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("me encaminha erro para next", async () => {
    const error = new Error("falha");
    repo.findById.mockRejectedValueOnce(error);
    const next = jest.fn();

    await controller.me({ user: { id: 5 } }, createMockResponse(), next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
