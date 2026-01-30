const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Agencia } = require("../models");
require("dotenv").config();

module.exports = {
  async register(req, res) {
    try {
      const { nome, email, senha, perfil, AgenciaId } = req.body;

      // ✅ 1. VERIFICA SE A AGÊNCIA EXISTE
      const agencia = await Agencia.findByPk(AgenciaId);
      if (!agencia) {
        return res.status(400).json({ error: "Agência não encontrada" });
      }

      // ✅ 2. VERIFICA SE USUÁRIO JÁ EXISTE
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: "Usuário já existe" });
      }

      // 🔐 3. CRIA O HASH DA SENHA
      const senhaHash = await bcrypt.hash(senha, 10);

      // ✅ 4. CRIA O USUÁRIO
      const user = await User.create({
        nome,
        email,
        senha: senhaHash,
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
      console.error("❌ ERRO NO REGISTER:");
      console.error(err);
      return res.status(500).json({
        error: "Erro ao cadastrar usuário",
        details: err.message,
      });
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
