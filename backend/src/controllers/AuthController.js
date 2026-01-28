const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models");
require("dotenv").config();

module.exports = {
  async register(req, res) {
    try {
      const { nome, email, senha, perfil, AgenciaId } = req.body;

      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: "Usuário já existe" });
      }

      const user = await User.create({
        nome,
        email,
        senha,
        perfil,
        AgenciaId,
      });

      return res.status(201).json({
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
      });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao cadastrar usuário" });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      const senhaValida = await bcrypt.compare(senha, user.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: "Senha inválida" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          perfil: user.perfil,
          agenciaId: user.AgenciaId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      return res.json({
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          perfil: user.perfil,
        },
        token,
      });
    } catch (err) {
      return res.status(500).json({ error: "Erro no login" });
    }
  },
};
