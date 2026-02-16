const AuthController = require("../../src/controllers/AuthController");
const { createMockResponse } = require("../helpers/mockResponse");

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("../../src/models", () => ({
  User: {
    findOne: jest.fn(),
  },
  Agencia: {},
}));

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../../src/models");

describe("AuthController.login", () => {
  beforeEach(() => {
    User.findOne.mockReset();
    bcrypt.compare.mockReset();
    jwt.sign.mockReset();
  });

  test("retorna 401 quando usuario nao existe", async () => {
    User.findOne.mockResolvedValue(null);
    const req = { body: { email: "ana@exemplo.com", senha: "123" } };
    const res = createMockResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "E-mail ou senha inválidos",
    });
  });

  test("retorna 403 quando usuario nao aprovado", async () => {
    User.findOne.mockResolvedValue({
      id: 1,
      aprovado: false,
      senha: "hash",
    });
    const req = { body: { email: "ana@exemplo.com", senha: "123" } };
    const res = createMockResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Usuário pendente de aprovação",
    });
  });

  test("retorna 401 quando senha e invalida", async () => {
    User.findOne.mockResolvedValue({
      id: 1,
      aprovado: true,
      senha: "hash",
    });
    bcrypt.compare.mockResolvedValue(false);
    const req = { body: { email: "ana@exemplo.com", senha: "123" } };
    const res = createMockResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "E-mail ou senha inválidos",
    });
  });

  test("retorna token quando login e valido", async () => {
    User.findOne.mockResolvedValue({
      id: 2,
      nome: "Ana",
      email: "ana@exemplo.com",
      perfil: "usuario",
      agenciaId: 3,
      senha: "hash",
      trocaSenha: false,
      aprovado: true,
      agencia: { id: 3, nome: "Ag 3", codigo: "0003" },
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token123");
    const req = { body: { email: "ana@exemplo.com", senha: "123" } };
    const res = createMockResponse();

    await AuthController.login(req, res);

    expect(res.json).toHaveBeenCalledWith({
      trocaSenha: false,
      user: {
        id: 2,
        nome: "Ana",
        email: "ana@exemplo.com",
        perfil: "usuario",
        agenciaId: 3,
        agencia: {
          id: 3,
          nome: "Ag 3",
          codigo: "0003",
        },
      },
      token: "token123",
    });
  });

  test("retorna token nulo quando trocaSenha for true", async () => {
    User.findOne.mockResolvedValue({
      id: 2,
      nome: "Ana",
      email: "ana@exemplo.com",
      perfil: "usuario",
      agenciaId: 3,
      senha: "hash",
      trocaSenha: true,
      aprovado: true,
      agencia: { id: 3, nome: "Ag 3", codigo: "0003" },
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token123");
    const req = { body: { email: "ana@exemplo.com", senha: "123" } };
    const res = createMockResponse();

    await AuthController.login(req, res);

    expect(res.json).toHaveBeenCalledWith({
      trocaSenha: true,
      user: {
        id: 2,
        nome: "Ana",
        email: "ana@exemplo.com",
        perfil: "usuario",
        agenciaId: 3,
        agencia: {
          id: 3,
          nome: "Ag 3",
          codigo: "0003",
        },
      },
      token: null,
    });
  });
});
