const { Agencia } = require("../models");

module.exports = {
  async create(req, res) {
    if (req.userPerfil !== "admin") {
      return res
        .status(403)
        .json({ error: "Somente admin pode criar agências" });
    }

    const { codigo, nome } = req.body;

    const exists = await Agencia.findOne({ where: { codigo } });
    if (exists) {
      return res.status(400).json({ error: "Código já cadastrado" });
    }

    const agencia = await Agencia.create({ codigo, nome });
    return res.status(201).json(agencia);
  },

  async index(req, res) {
    if (req.userPerfil === "usuario") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    if (req.userPerfil === "gerente") {
      const agencia = await Agencia.findByPk(req.userAgenciaId);
      return res.json([agencia]);
    }

    const agencias = await Agencia.findAll();
    return res.json(agencias);
  },

  async show(req, res) {
    const { id } = req.params;

    if (req.userPerfil === "usuario") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    if (req.userPerfil === "gerente" && id !== req.userAgenciaId) {
      return res.status(403).json({ error: "Acesso negado à agência" });
    }

    const agencia = await Agencia.findByPk(id);
    if (!agencia) {
      return res.status(404).json({ error: "Agência não encontrada" });
    }

    return res.json(agencia);
  },

  async update(req, res) {
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Somente admin pode atualizar" });
    }

    const { id } = req.params;
    const agencia = await Agencia.findByPk(id);

    if (!agencia) {
      return res.status(404).json({ error: "Agência não encontrada" });
    }

    await agencia.update(req.body);
    return res.json(agencia);
  },

  async delete(req, res) {
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Somente admin pode excluir" });
    }

    const { id } = req.params;
    const agencia = await Agencia.findByPk(id);

    if (!agencia) {
      return res.status(404).json({ error: "Agência não encontrada" });
    }

    await agencia.destroy();
    return res.status(204).send();
  },
};
