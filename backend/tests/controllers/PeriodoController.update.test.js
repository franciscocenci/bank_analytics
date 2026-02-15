const PeriodoController = require("../../src/controllers/PeriodoController");
const { createMockResponse } = require("../helpers/mockResponse");

jest.mock("../../src/models", () => ({
  Periodo: {
    findByPk: jest.fn(),
  },
}));

const { Periodo } = require("../../src/models");

describe("PeriodoController.update", () => {
  beforeEach(() => {
    Periodo.findByPk.mockReset();
  });

  test("returns 404 when period not found", async () => {
    Periodo.findByPk.mockResolvedValue(null);
    const req = {
      userPerfil: "admin",
      params: { id: "1" },
      body: { dataInicio: "2026-01-01", dataFim: "2026-12-31" },
    };
    const res = createMockResponse();

    await PeriodoController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Período não encontrado" });
  });

  test("rejects invalid date range", async () => {
    Periodo.findByPk.mockResolvedValue({ update: jest.fn() });
    const req = {
      userPerfil: "admin",
      params: { id: "1" },
      body: { dataInicio: "2026-12-31", dataFim: "2026-01-01" },
    };
    const res = createMockResponse();

    await PeriodoController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "A data final deve ser maior que a data inicial",
    });
  });
});
