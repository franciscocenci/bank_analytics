const { Produto } = require("../models");

const MENSURACOES_VALIDAS = new Set(["volume", "quantidade"]);

module.exports = {
  async index(req, res) {
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const produtos = await Produto.findAll({
      order: [["nome", "ASC"]],
      attributes: ["id", "nome", "mensuracao", "ativo"],
    });

    return res.json(produtos);
  },

  async update(req, res) {
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { id } = req.params;
    const { mensuracao } = req.body;

    if (!MENSURACOES_VALIDAS.has(mensuracao)) {
      return res.status(400).json({ error: "Mensuração inválida" });
    }

    const produto = await Produto.findByPk(id);

    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    await produto.update({ mensuracao });

    return res.json({
      id: produto.id,
      nome: produto.nome,
      mensuracao: produto.mensuracao,
      ativo: produto.ativo,
    });
  },
};
