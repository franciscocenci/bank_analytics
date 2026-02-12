const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Agencia } = require("../models");
require("dotenv").config();

module.exports = {
  async register(req, res) {
    try {
      const { nome, email, senha, perfil, AgenciaId } = req.body;
      const agenciaId = AgenciaId;

      // Validate agency exists.
      const agencia = await Agencia.findByPk(agenciaId);
      if (!agencia) {
        return res.status(400).json({ error: "Agência não encontrada" });
      }

      // Check for existing user.
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: "Usuário já existe" });
      }

      // Hash password before storing.
      const senhaHash = await bcrypt.hash(senha, 10);

      // Create user with the provided profile.
      const user = await User.create({
        nome,
        email,
        senha: senhaHash,
        perfil,
        agenciaId,
        trocaSenha: false, // Not a temporary password.
      });

      return res.status(201).json({
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
      });
    } catch (err) {
      console.error("Erro no registro:");
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

      const user = await User.findOne({
        where: { email },
        attributes: [
          "id",
          "nome",
          "email",
          "perfil",
          "agenciaId",
          "senha",
          "trocaSenha",
        ],
        include: [
          {
            model: Agencia,
            as: "agencia",
            attributes: ["id", "nome", "codigo"],
          },
        ],
      });

      if (!user) {
        return res.status(401).json({ error: "E-mail ou senha inválidos" });
      }

      const senhaValida = await bcrypt.compare(senha, user.senha);

      if (!senhaValida) {
        return res.status(401).json({ error: "E-mail ou senha inválidos" });
      }


      const token = jwt.sign(
        {
          id: user.id,
          perfil: user.perfil,
          agenciaId: user.agenciaId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      return res.json({
        trocaSenha: user.trocaSenha,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          perfil: user.perfil,
          agenciaId: user.agenciaId,
          agencia: user.agencia
            ? {
                id: user.agencia.id,
                nome: user.agencia.nome,
                codigo: user.agencia.codigo,
              }
            : null,
        },
        token: user.trocaSenha ? null : token,
      });
    } catch (err) {
      console.error("Erro no processo de login:");
      console.error(err);
      return res
        .status(500)
        .json({ error: "Erro interno no servidor", details: err.message });
    }
  },

  async trocarSenha(req, res) {
    try {
      const { email, senhaAtual, novaSenha } = req.body;

      if (!email || !senhaAtual || !novaSenha) {
        return res.status(400).json({
          error: "Preencha todos os campos",
        });
      }

      // Additional validations for password update.
      if (novaSenha.length < 6) {
        return res.status(400).json({
          error: "A nova senha deve ter no mínimo 6 caracteres",
        });
      }

      const user = await User.findOne({
        where: { email },
        attributes: [
          "id",
          "nome",
          "email",
          "perfil",
          "agenciaId",
          "senha",
          "trocaSenha",
        ],
        include: [
          {
            model: Agencia,
            as: "agencia",
            attributes: ["id", "nome", "codigo"],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const senhaValida = await bcrypt.compare(senhaAtual, user.senha);

      // Validate current password.
      if (!senhaValida) {
        return res.status(401).json({ error: "Senha atual inválida" });
      }

      // Ensure the new password is different.
      if (senhaAtual === novaSenha) {
        return res.status(400).json({
          error: "A nova senha não pode ser igual à senha atual",
        });
      }
      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      await user.update({
        senha: novaSenhaHash,
        trocaSenha: false,
      });

      // Generate a new token after a successful password change.
      const token = jwt.sign(
        {
          id: user.id,
          perfil: user.perfil,
          agenciaId: user.agenciaId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      return res.json({
        message: "Senha alterada com sucesso",
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          perfil: user.perfil,
          agenciaId: user.agenciaId,
          agencia: user.agencia
            ? {
                id: user.agencia.id,
                nome: user.agencia.nome,
                codigo: user.agencia.codigo,
              }
            : null,
        },
        token,
      });
    } catch (err) {
      console.error("Erro ao trocar senha:", err);
      return res.status(500).json({
        error: "Erro ao trocar senha",
      });
    }
  },
};
