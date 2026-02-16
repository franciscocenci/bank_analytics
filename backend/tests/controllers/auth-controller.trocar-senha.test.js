const AuthController = require("../../src/controllers/AuthController");
const { createMockResponse } = require("../helpers/mockResponse");

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
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

describe("AuthController.trocarSenha", () => {
  beforeEach(() => {
    User.findOne.mockReset();
    bcrypt.compare.mockReset();
    bcrypt.hash.mockReset();
    jwt.sign.mockReset();
  });

  test("exige todos os campos", async () => {
    const req = { body: { email: "", senhaAtual: "", novaSenha: "" } };
    const res = createMockResponse();

    await AuthController.trocarSenha(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Preencha todos os campos",
    });
  });

  test("rejeita nova senha curta", async () => {
    const req = {
      body: {
        email: "francisco@exemplo.com",
        senhaAtual: "123456",
        novaSenha: "123",
      },
    };
    const res = createMockResponse();

    await AuthController.trocarSenha(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "A nova senha deve ter no mínimo 6 caracteres",
    });
  });

  test("retorna 404 quando usuario nao encontrado", async () => {
    User.findOne.mockResolvedValue(null);
    const req = {
      body: {
        email: "francisco@exemplo.com",
        senhaAtual: "123456",
        novaSenha: "654321",
      },
    };
    const res = createMockResponse();

    await AuthController.trocarSenha(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Usuário não encontrado" });
  });

  test("retorna 401 quando senha atual e invalida", async () => {
    User.findOne.mockResolvedValue({ senha: "hash" });
    bcrypt.compare.mockResolvedValue(false);
    const req = {
      body: {
        email: "francisco@exemplo.com",
        senhaAtual: "123456",
        novaSenha: "654321",
      },
    };
    const res = createMockResponse();

    await AuthController.trocarSenha(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Senha atual inválida" });
  });

  test("retorna 400 quando nova senha e igual a atual", async () => {
    User.findOne.mockResolvedValue({ senha: "hash" });
    bcrypt.compare.mockResolvedValue(true);
    const req = {
      body: {
        email: "francisco@exemplo.com",
        senhaAtual: "123456",
        novaSenha: "123456",
      },
    };
    const res = createMockResponse();

    await AuthController.trocarSenha(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "A nova senha não pode ser igual à senha atual",
    });
  });

  test("atualiza senha e retorna token", async () => {
    const update = jest.fn();
    User.findOne.mockResolvedValue({
      id: 1,
      nome: "Francisco",
      email: "francisco@exemplo.com",
      perfil: "usuario",
      agenciaId: 3,
      senha: "hash",
      trocaSenha: true,
      agencia: { id: 3, nome: "Ag 3", codigo: "0003" },
      update,
    });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("hashNova");
    jwt.sign.mockReturnValue("token123");

    const req = {
      body: {
        email: "francisco@exemplo.com",
        senhaAtual: "123456",
        novaSenha: "654321",
      },
    };
    const res = createMockResponse();

    await AuthController.trocarSenha(req, res);

    expect(update).toHaveBeenCalledWith({
      senha: "hashNova",
      trocaSenha: false,
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Senha alterada com sucesso",
      user: {
        id: 1,
        nome: "Francisco",
        email: "francisco@exemplo.com",
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
});
