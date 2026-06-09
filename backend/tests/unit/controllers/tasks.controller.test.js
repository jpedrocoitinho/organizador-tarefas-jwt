jest.mock("../../../src/repositories/task.repo", () => ({
  list: jest.fn(),
  create: jest.fn(),
  markDone: jest.fn(),
  remove: jest.fn()
}));

const repo = require("../../../src/repositories/task.repo");
const controller = require("../../../src/controllers/tasks.controller");
const { createMockResponse } = require("../../helpers/mockResponse");

describe("controllers/tasks.controller", () => {
  beforeEach(() => jest.clearAllMocks());

  test("list retorna tarefas do usuario autenticado", async () => {
    const tasks = [{ id: 1, title: "Estudar" }];
    repo.list.mockResolvedValueOnce(tasks);
    const res = createMockResponse();

    await controller.list({ user: { id: 5 } }, res, jest.fn());

    expect(repo.list).toHaveBeenCalledWith(5);
    expect(res.json).toHaveBeenCalledWith(tasks);
  });

  test("create valida titulo obrigatorio", async () => {
    const res = createMockResponse();

    await controller.create({ user: { id: 5 }, body: {} }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(repo.create).not.toHaveBeenCalled();
  });

  test("create cria tarefa com user_id autenticado", async () => {
    repo.create.mockResolvedValueOnce(9);
    const body = { title: "Estudar" };
    const res = createMockResponse();

    await controller.create({ user: { id: 5 }, body }, res, jest.fn());

    expect(repo.create).toHaveBeenCalledWith(5, body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 9, message: "Tarefa criada" });
  });

  test("markDone atualiza tarefa", async () => {
    repo.markDone.mockResolvedValueOnce(1);
    const res = createMockResponse();

    await controller.markDone(
      { user: { id: 5 }, params: { id: "8" }, body: { done: true } },
      res,
      jest.fn()
    );

    expect(repo.markDone).toHaveBeenCalledWith(5, "8", true);
    expect(res.json).toHaveBeenCalledWith({ message: "Tarefa atualizada" });
  });

  test("markDone retorna 404 para tarefa inexistente", async () => {
    repo.markDone.mockResolvedValueOnce(0);
    const res = createMockResponse();

    await controller.markDone(
      { user: { id: 5 }, params: { id: "8" }, body: { done: true } },
      res,
      jest.fn()
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("remove exclui tarefa e retorna 204", async () => {
    repo.remove.mockResolvedValueOnce(1);
    const res = createMockResponse();

    await controller.remove(
      { user: { id: 5 }, params: { id: "8" } },
      res,
      jest.fn()
    );

    expect(repo.remove).toHaveBeenCalledWith(5, "8");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  test("remove retorna 404 para tarefa inexistente", async () => {
    repo.remove.mockResolvedValueOnce(0);
    const res = createMockResponse();

    await controller.remove(
      { user: { id: 5 }, params: { id: "8" } },
      res,
      jest.fn()
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test.each(["list", "create", "markDone", "remove"])(
    "%s encaminha erro para next",
    async (method) => {
      const error = new Error("falha");
      repo[method].mockRejectedValueOnce(error);
      const next = jest.fn();
      const req = {
        user: { id: 5 },
        body: { title: "Estudar", done: true },
        params: { id: "8" }
      };

      await controller[method](req, createMockResponse(), next);

      expect(next).toHaveBeenCalledWith(error);
    }
  );
});
