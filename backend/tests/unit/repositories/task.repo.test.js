jest.mock("../../../src/config/db", () => ({
  query: jest.fn()
}));

const db = require("../../../src/config/db");
const repo = require("../../../src/repositories/task.repo");

describe("repositories/task.repo", () => {
  beforeEach(() => jest.clearAllMocks());

  test("lista tarefas usando o user_id", async () => {
    const tasks = [{ id: 1, title: "Estudar" }];
    db.query.mockResolvedValueOnce([tasks]);

    const result = await repo.list(5);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE user_id = ?"),
      [5]
    );
    expect(result).toEqual(tasks);
  });

  test("cria tarefa usando o user_id", async () => {
    db.query.mockResolvedValueOnce([{ insertId: 9 }]);
    const data = {
      title: "Estudar Jest",
      description: "Criar testes",
      due_date: "2026-06-20"
    };

    const result = await repo.create(5, data);

    expect(db.query).toHaveBeenCalledWith(
      "INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)",
      [5, "Estudar Jest", "Criar testes", "2026-06-20"]
    );
    expect(result).toBe(9);
  });

  test("cria tarefa com campos opcionais nulos", async () => {
    db.query.mockResolvedValueOnce([{ insertId: 10 }]);

    await repo.create(5, { title: "Sem opcionais" });

    expect(db.query).toHaveBeenCalledWith(
      expect.any(String),
      [5, "Sem opcionais", null, null]
    );
  });

  test("marca tarefa como concluida usando id e user_id", async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await repo.markDone(5, 8, true);

    expect(db.query).toHaveBeenCalledWith(
      "UPDATE tasks SET done = ? WHERE id = ? AND user_id = ?",
      [1, 8, 5]
    );
    expect(result).toBe(1);
  });

  test("marca tarefa como pendente", async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await repo.markDone(5, 8, false);

    expect(db.query).toHaveBeenCalledWith(expect.any(String), [0, 8, 5]);
  });

  test("exclui tarefa usando id e user_id", async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await repo.remove(5, 8);

    expect(db.query).toHaveBeenCalledWith(
      "DELETE FROM tasks WHERE id = ? AND user_id = ?",
      [8, 5]
    );
    expect(result).toBe(1);
  });
});
