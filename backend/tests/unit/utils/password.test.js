const {
  hashPassword,
  comparePassword
} = require("../../../src/utils/password");

describe("utils/password", () => {
  test("deve gerar hash diferente da senha original", async () => {
    const hash = await hashPassword("senha123");

    expect(hash).toBeDefined();
    expect(hash).not.toBe("senha123");
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  test("deve validar senha correta", async () => {
    const hash = await hashPassword("senha123");

    const resultado = await comparePassword("senha123", hash);

    expect(resultado).toBe(true);
  });

  test("deve recusar senha incorreta", async () => {
    const hash = await hashPassword("senha123");

    const resultado = await comparePassword("senha-errada", hash);

    expect(resultado).toBe(false);
  });
});
