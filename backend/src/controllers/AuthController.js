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

      // 🔍 LOG 1: O que veio do Frontend?
      console.log("------------------------------------------");
      console.log("📥 Tentativa de Login recebida:");
      console.log("E-mail digitado:", email);
      console.log("Senha digitada:", senha ? "****** (preenchida)" : "VAZIA");

      const user = await User.findOne({ where: { email } });

      // 🔍 LOG 2: O usuário foi encontrado no banco?
      if (!user) {
        console.log("❌ Resultado: Usuário não encontrado no banco de dados.");
        return res.status(401).json({ error: "E-mail ou senha inválidos" });
      }

      console.log("✅ Resultado: Usuário encontrado!", user.nome);

      const senhaValida = await bcrypt.compare(senha, user.senha);

      // 🔍 LOG 3: A senha bateu?
      if (!senhaValida) {
        console.log("❌ Resultado: Senha incorreta.");
        return res.status(401).json({ error: "E-mail ou senha inválidos" });
      }

      console.log("🔑 Resultado: Senha validada com sucesso!");

      // Verifica se a chave secreta existe
      if (!process.env.JWT_SECRET) {
        console.log(
          "⚠️ ERRO CRÍTICO: Variável JWT_SECRET não definida no .env!",
        );
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

      console.log("🚀 Login realizado! Token gerado.");
      console.log("------------------------------------------");

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
      // 🔍 LOG 4: Se o sistema travar, por que foi?
      console.error("💥 ERRO NO PROCESSO DE LOGIN:");
      console.error(err);
      return res
        .status(500)
        .json({ error: "Erro interno no servidor", details: err.message });
    }
  },
};
