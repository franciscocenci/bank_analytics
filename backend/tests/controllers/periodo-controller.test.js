const PeriodoController = require("../../src/controllers/PeriodoController");
const { createMockResponse } = require("../helpers/mockResponse");

jest.mock("../../src/models", () => ({
  Periodo: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

const { Periodo } = require("../../src/models");

describe("PeriodoController.create", () => {
  beforeEach(() => {
    Periodo.findOne.mockReset();
    Periodo.create.mockReset();
  });

  test("bloqueio de users não admin", async () => {
    const req = { userPerfil: "usuario", body: {} };
    const res = createMockResponse();

    await PeriodoController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Acesso negado" });
  });

  test("requer data inicial e final", async () => {
    const req = { userPerfil: "admin", body: {} };
    const res = createMockResponse();

    await PeriodoController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Data inicial e data final são obrigatórias",
    });
  });

  test("rejeita quando a data final é anterior à data inicial", async () => {
    const req = {
      userPerfil: "admin",
      body: { dataInicio: "2026-02-14", dataFim: "2026-02-10" },
    };
    const res = createMockResponse();

    await PeriodoController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "A data final deve ser maior que a data inicial",
    });
  });

  test("rejeita período sobreposto", async () => {
    Periodo.findOne.mockResolvedValue({ dataFim: "2026-06-30" });
    const req = {
      userPerfil: "admin",
      body: { dataInicio: "2026-06-01", dataFim: "2026-12-31" },
    };
    const res = createMockResponse();

    await PeriodoController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "A data inicial não pode ser menor que a data final do último período",
    });
  });

  test("cria período quando válido", async () => {
    Periodo.findOne.mockResolvedValue(null);
    Periodo.create.mockResolvedValue({ id: 10 });
    const req = {
      userPerfil: "admin",
      body: { dataInicio: "2026-07-01", dataFim: "2026-12-31" },
    };
    const res = createMockResponse();

    await PeriodoController.create(req, res);

    expect(Periodo.create).toHaveBeenCalledWith({
      dataInicio: "2026-07-01",
      dataFim: "2026-12-31",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 10 });
  });
});
