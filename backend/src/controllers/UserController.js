const { User, Agencia } = require("../models");
const bcrypt = require("bcrypt");

module.exports = {
  async create(req, res) {
    const { nome, email, senha, perfil, AgenciaId, agenciaId: agenciaIdBody } =
      req.body;
    const agenciaId = agenciaIdBody || AgenciaId;

    if (!nome || !email || !senha || !perfil || !agenciaId) {
      return res.status(400).json({
        error: "Todos os campos são obrigatórios",
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        error: "Senha deve ter no mínimo 6 caracteres",
      });
    }

    // Profile-based creation rules.
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
      agenciaId,
      trocaSenha: true, // Temporary password required.
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
      where.agenciaId = req.userAgenciaId;
    }

    /* const users = await User.findAll({
      where,
      attributes: ["id", "nome", "email", "perfil", "AgenciaId"],
      include: [
        {
          association: "agencia",
          attributes: ["id", "nome"],
        },
      ],
    }); */

    const usuarios = await User.findAll({
      where,
      include: [
        {
          model: Agencia,
          as: "agencia",
          attributes: ["id", "nome"],
        },
      ],
    });

    return res.json(usuarios);
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
    if (req.userPerfil !== "admin") {
      return res
        .status(403)
        .json({ error: "Somente admin pode editar usuários" });
    }

    const { id } = req.params;
    const { nome, email, perfil, AgenciaId, agenciaId: agenciaIdBody, senha } =
      req.body;
    const agenciaId = agenciaIdBody || AgenciaId;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Prevent removing the last admin.
    if (user.perfil === "admin" && perfil !== "admin") {
      const totalAdmins = await User.count({
        where: { perfil: "admin" },
      });

      if (totalAdmins <= 1) {
        return res.status(400).json({
          error: "Não é permitido remover o último administrador",
        });
      }
    }

    await user.update({
      nome,
      perfil,
      agenciaId,
    });

    return res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
    });
  },

  async resetSenha(req, res) {
    // Only admins can reset passwords.
    if (req.userPerfil !== "admin") {
      return res.status(403).json({
        error: "Somente admin pode resetar senha",
      });
    }

    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    // Prevent reset of the last admin.
    if (user.perfil === "admin") {
      const totalAdmins = await User.count({
        where: { perfil: "admin" },
      });

      if (totalAdmins <= 1) {
        return res.status(400).json({
          error: "Não é permitido resetar a senha do último administrador",
        });
      }
    }

    // Generate a temporary password.
    const senhaProvisoria = "123456"; // depois podemos melhorar isso
    const senhaHash = await bcrypt.hash(senhaProvisoria, 10);

    await user.update({
      senha: senhaHash,
      trocaSenha: true,
    });

    return res.json({
      message: "Senha resetada com sucesso",
      senhaProvisoria, // Consider hiding this in the UI.
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

    // Prevent deleting the last admin.
    if (user.perfil === "admin") {
      const totalAdmins = await User.count({ where: { perfil: "admin" } });

      if (totalAdmins <= 1) {
        return res.status(400).json({
          error: "Não é permitido excluir o último administrador do sistema",
        });
      }
    }

    // Prevent self-deletion.
    if (Number(id) === req.userId) {
      return res.status(400).json({
        error: "Administrador não pode se excluir",
      });
    }

    await user.destroy();
    return res.status(204).send();
  },
};
