const AuthController = require("../../src/controllers/AuthController");
const { createMockResponse } = require("../helpers/mockResponse");

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

jest.mock("crypto", () => ({
  randomBytes: jest.fn(),
}));

jest.mock("../../src/models", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Agencia: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
}));

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { User, Agencia } = require("../../src/models");

describe("AuthController.register", () => {
  beforeEach(() => {
    User.findOne.mockReset();
    User.create.mockReset();
    Agencia.findOne.mockReset();
    Agencia.findByPk.mockReset();
    bcrypt.hash.mockReset();
    crypto.randomBytes.mockReset();
  });

  test("exige nome e email", async () => {
    const req = { body: { nome: "", email: "" } };
    const res = createMockResponse();

    await AuthController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Nome e e-mail são obrigatórios",
    });
  });

  test("rejeita quando a agência não é encontrada", async () => {
    Agencia.findByPk.mockResolvedValue(null);

    const req = {
      body: {
        nome: "Francisco",
        email: "francisco@exemplo.com",
        agenciaId: 7,
      },
    };
    const res = createMockResponse();

    await AuthController.register(req, res);

    expect(Agencia.findByPk).toHaveBeenCalledWith(7);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Agência não encontrada" });
  });

  test("rejeita quando o usuário já existe", async () => {
    Agencia.findByPk.mockResolvedValue({ id: 1 });
    User.findOne.mockResolvedValue({ id: 10 });

    const req = {
      body: {
        nome: "Francisco",
        email: "francisco@exemplo.com",
        agenciaId: 1,
      },
    };
    const res = createMockResponse();

    await AuthController.register(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: "francisco@exemplo.com" },
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Usuário já existe" });
  });

  test("cria usuário usando código da agência", async () => {
    Agencia.findOne.mockResolvedValue({ id: 7 });
    Agencia.findByPk.mockResolvedValue({ id: 7 });
    User.findOne.mockResolvedValue(null);
    crypto.randomBytes.mockReturnValue(Buffer.from("abc"));
    bcrypt.hash.mockResolvedValue("hash123");
    User.create.mockResolvedValue({
      id: 55,
      nome: "Francisco",
      email: "francisco@exemplo.com",
      perfil: "usuario",
      aprovado: false,
    });

    const req = {
      body: {
        nome: "Francisco",
        email: "francisco@exemplo.com",
        codigoAgencia: "12",
      },
    };
    const res = createMockResponse();

    await AuthController.register(req, res);

    expect(Agencia.findOne).toHaveBeenCalledTimes(1);
    expect(User.create).toHaveBeenCalledWith({
      nome: "Francisco",
      email: "francisco@exemplo.com",
      senha: "hash123",
      perfil: "usuario",
      agenciaId: 7,
      trocaSenha: true,
      aprovado: false,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 55,
      nome: "Francisco",
      email: "francisco@exemplo.com",
      perfil: "usuario",
      aprovado: false,
      message: "Cadastro recebido. Aguarde aprovacao do administrador.",
    });
  });
});
