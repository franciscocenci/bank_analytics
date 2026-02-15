
const AuthController = require('../../src/controllers/AuthController');
const db = require('../../src/models');
const User = db.User;
const Agencia = db.Agencia;
const { createMockResponse } = require('../helpers/mockResponse');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

jest.mock('jsonwebtoken');
jest.mock('bcrypt');

const validToken = 'valid-token';
const validTokenHash = crypto.createHash('sha256').update(validToken).digest('hex');
const now = new Date();
const userMock = {
  id: 1,
  nome: 'Usuário Teste',
  email: 'teste@teste.com',
  perfil: 'admin',
  agenciaId: 2,
  agencia: { id: 2, nome: 'Agência XPTO', codigo: '123' },
  update: jest.fn(),
};

describe('AuthController.trocarSenhaToken', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { token: validToken, novaSenha: 'novaSenha123' } };
    res = createMockResponse();
    jest.clearAllMocks();
  });

  it('deve retornar erro se token ou novaSenha não forem enviados', async () => {
    req.body = { token: '', novaSenha: '' };
    await AuthController.trocarSenhaToken(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Token e nova senha obrigatórios') });
  });

  it('deve retornar erro se novaSenha for muito curta', async () => {
    req.body.novaSenha = '123';
    await AuthController.trocarSenhaToken(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('mínimo 6 caracteres') });
  });

  it('deve retornar erro se token for inválido ou expirado', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    await AuthController.trocarSenhaToken(req, res);
    expect(User.findOne).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ resetSenhaTokenHash: validTokenHash }),
    }));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Token inválido ou expirado') });
    User.findOne.mockRestore();
  });

  it('deve trocar a senha com sucesso e retornar user + token', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(userMock);
    bcrypt.hash.mockResolvedValue('senha-hash');
    userMock.update.mockResolvedValue();
    jwt.sign.mockReturnValue('jwt-token');

    await AuthController.trocarSenhaToken(req, res);

    expect(User.findOne).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ resetSenhaTokenHash: validTokenHash }),
    }));
    expect(bcrypt.hash).toHaveBeenCalledWith('novaSenha123', 10);
    expect(userMock.update).toHaveBeenCalledWith(expect.objectContaining({ senha: 'senha-hash', trocaSenha: false, aprovado: true, resetSenhaTokenHash: null, resetSenhaTokenExpiraEm: null }));
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ id: userMock.id, perfil: userMock.perfil, agenciaId: userMock.agenciaId }),
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Senha definida com sucesso'),
      user: expect.objectContaining({ id: userMock.id, nome: userMock.nome, email: userMock.email, perfil: userMock.perfil, agenciaId: userMock.agenciaId, agencia: expect.any(Object) }),
      token: 'jwt-token',
    }));
    User.findOne.mockRestore();
  });

  it('deve retornar erro 500 em exceção inesperada', async () => {
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('DB error'));
    await AuthController.trocarSenhaToken(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Erro ao trocar senha') });
    User.findOne.mockRestore();
  });
});
