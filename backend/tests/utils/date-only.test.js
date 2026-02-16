const toDateOnly = require("../../src/utils/dateOnly");

describe("dateOnly", () => {
  test("retorna string no formato YYYY-MM-DD", () => {
    const result = toDateOnly("2026-02-14T10:30:00Z");
    expect(result).toBe("2026-02-14");
  });

  test("deve extrair apenas a data de um objeto Date", () => {
    const date = new Date("2026-02-14T03:00:00Z");
    const result = toDateOnly(date);
    expect(result).toBe("2026-02-14");
  });
});
