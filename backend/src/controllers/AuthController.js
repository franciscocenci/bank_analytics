const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Op } = require("sequelize");
const { User, Agencia } = require("../models");
require("dotenv").config();

module.exports = {
  async register(req, res) {
    try {
      const {
        nome,
        email,
        AgenciaId,
        agenciaId: agenciaIdBody,
        codigoAgencia,
      } = req.body;
      let agenciaId = agenciaIdBody || AgenciaId || null;

      if (!nome || !email) {
        return res.status(400).json({ error: "Nome e e-mail são obrigatórios" });
      }

      if (!agenciaId && codigoAgencia) {
        const codigoBruto = String(codigoAgencia).trim();
        const codigoPad = codigoBruto.padStart(4, "0");
        const codigoSemZeros = codigoBruto.replace(/^0+/, "") || "0";
        const codigos = Array.from(
          new Set([codigoBruto, codigoPad, codigoSemZeros]),
        );

        const agenciaPorCodigo = await Agencia.findOne({
          where: { codigo: { [Op.in]: codigos } },
        });
        agenciaId = agenciaPorCodigo?.id || null;
      }

      // Validate agency exists.
      const agencia = agenciaId ? await Agencia.findByPk(agenciaId) : null;
      if (!agencia) {
        return res.status(400).json({ error: "Agência não encontrada" });
      }

      // Check for existing user.
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: "Usuário já existe" });
      }

      const senhaTemporaria = crypto.randomBytes(12).toString("hex");
      const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

      // Public self-registration always creates a pending user.
      const user = await User.create({
        nome,
        email,
        senha: senhaHash,
        perfil: "usuario",
        agenciaId,
        trocaSenha: true,
        aprovado: false,
      });

      return res.status(201).json({
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        aprovado: user.aprovado,
        message: "Cadastro recebido. Aguarde aprovacao do administrador.",
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
          "aprovado",
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

      if (user.aprovado === false) {
        return res
          .status(403)
          .json({ error: "Usuário pendente de aprovação" });
      }

      if (!user.senha) {
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

  async trocarSenhaToken(req, res) {
    try {
      const { token, novaSenha } = req.body;

      if (!token || !novaSenha) {
        return res.status(400).json({ error: "Token e nova senha obrigatórios" });
      }

      if (novaSenha.length < 6) {
        return res
          .status(400)
          .json({ error: "A nova senha deve ter no mínimo 6 caracteres" });
      }

      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const agora = new Date();
      const user = await User.findOne({
        where: {
          resetSenhaTokenHash: tokenHash,
          resetSenhaTokenExpiraEm: { [Op.gt]: agora },
        },
        include: [
          {
            model: Agencia,
            as: "agencia",
            attributes: ["id", "nome", "codigo"],
          },
        ],
      });

      if (!user) {
        return res.status(400).json({ error: "Token inválido ou expirado" });
      }

      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      await user.update({
        senha: novaSenhaHash,
        trocaSenha: false,
        aprovado: true,
        resetSenhaTokenHash: null,
        resetSenhaTokenExpiraEm: null,
      });

      const jwtToken = jwt.sign(
        {
          id: user.id,
          perfil: user.perfil,
          agenciaId: user.agenciaId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      return res.json({
        message: "Senha definida com sucesso",
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
        token: jwtToken,
      });
    } catch (err) {
      console.error("Erro ao trocar senha via token:", err);
      return res.status(500).json({
        error: "Erro ao trocar senha",
      });
    }
  },
};
