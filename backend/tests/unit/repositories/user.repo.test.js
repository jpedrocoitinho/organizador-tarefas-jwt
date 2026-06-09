jest.mock("../../../src/config/db", () => ({
  query: jest.fn()
}));

const db = require("../../../src/config/db");
const repo = require("../../../src/repositories/user.repo");

describe("repositories/user.repo", () => {
  beforeEach(() => jest.clearAllMocks());

  test("busca usuario por e-mail", async () => {
    const user = { id: 1, email: "ana@email.com" };
    db.query.mockResolvedValueOnce([[user]]);

    const result = await repo.findByEmail("ana@email.com");

    expect(db.query).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = ?",
      ["ana@email.com"]
    );
    expect(result).toEqual(user);
  });

  test("cria usuario e retorna insertId", async () => {
    db.query.mockResolvedValueOnce([{ insertId: 7 }]);

    const result = await repo.createUser("Ana", "ana@email.com", "hash");

    expect(db.query).toHaveBeenCalledWith(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      ["Ana", "ana@email.com", "hash"]
    );
    expect(result).toBe(7);
  });

  test("busca usuario por id sem retornar password_hash", async () => {
    const user = { id: 1, name: "Ana", email: "ana@email.com" };
    db.query.mockResolvedValueOnce([[user]]);

    const result = await repo.findById(1);

    expect(db.query).toHaveBeenCalledWith(
      "SELECT id, name, email FROM users WHERE id = ?",
      [1]
    );
    expect(result).toEqual(user);
    expect(result).not.toHaveProperty("password_hash");
  });
});
