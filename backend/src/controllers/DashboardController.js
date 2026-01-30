const { VendaMeta, Agencia } = require("../models");
const { Op } = require("sequelize");

module.exports = {
  async evolucao(req, res) {
    try {
      const { agenciaId, produto, dataInicio, dataFim } = req.query;

      // 🔎 Monta filtros dinamicamente
      const where = {};

      if (agenciaId) {
        where.AgenciaId = agenciaId;
      }

      if (produto) {
        where.produto = produto;
      }

      if (dataInicio && dataFim) {
        where.data = {
          [Op.between]: [dataInicio, dataFim],
        };
      }

      const dados = await VendaMeta.findAll({
        where,
        include: [
          {
            model: Agencia,
            attributes: ["id", "nome", "codigo"],
          },
        ],
        order: [["data", "ASC"]],
      });

      return res.json(dados);
    } catch (err) {
      console.error("❌ Erro no dashboard evolução:", err);
      return res.status(500).json({ error: "Erro ao buscar evolução" });
    }
  },
};
