const { User } = require("../models");
const bcrypt = require("bcrypt");

module.exports = {
  async create(req, res) {
    const { nome, email, senha, perfil, AgenciaId } = req.body;

    // Regras de perfil
    if (req.userPerfil === "gerente" && perfil !== "usuario") {
      return res.status(403).json({
        error: "Gerente só pode criar usuário comum",
      });
    }

    if (req.userPerfil === "usuario") {
      return res.status(403).json({
        error: "Usuário não pode criar usuários",
      });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

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
  },

  async index(req, res) {
    if (req.userPerfil === "usuario") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const where = {};

    if (req.userPerfil === "gerente") {
      where.AgenciaId = req.userAgenciaId;
    }

    const users = await User.findAll({
      where,
      attributes: ["id", "nome", "email", "perfil"],
    });

    return res.json(users);
  },

  async show(req, res) {
    const { id } = req.params;

    if (req.userPerfil === "usuario" && req.userId !== id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const user = await User.findByPk(id, {
      attributes: ["id", "nome", "email", "perfil"],
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json(user);
  },

  async update(req, res) {
    const { id } = req.params;

    if (req.userPerfil !== "admin" && req.userId !== id) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await user.update(req.body);

    return res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
    });
  },

  async delete(req, res) {
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Somente admin pode excluir" });
    }

    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // 🔐 Impede exclusão do próprio admin
    if (user.perfil === "admin") {
      const totalAdmins = await User.count({ where: { perfil: "admin" } });

      if (totalAdmins <= 1) {
        return res.status(400).json({
          error: "Não é permitido excluir o último administrador do sistema",
        });
      }
    }

    await user.destroy();
    return res.status(204).send();
  },
};
