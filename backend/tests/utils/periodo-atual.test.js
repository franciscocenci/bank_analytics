const obterPeriodoAtual = require("../../src/utils/periodoAtual");

jest.mock("../../src/models", () => ({
  Periodo: {
    findOne: jest.fn(),
  },
}));

const { Periodo } = require("../../src/models");

describe("periodoAtual", () => {
  test("consulta período atual por limite de datas", async () => {
    Periodo.findOne.mockResolvedValue({ id: 1 });
    const result = await obterPeriodoAtual();

    expect(Periodo.findOne).toHaveBeenCalledTimes(1);
    const args = Periodo.findOne.mock.calls[0][0];
    expect(args).toHaveProperty("where");
    expect(result).toEqual({ id: 1 });
  });
});
