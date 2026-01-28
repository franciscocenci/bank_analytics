const { VendaMeta, Agencia, User } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

module.exports = {
  // 1️⃣ Total geral
  async resumoGeral(req, res) {
    const where = {};

    if (req.userPerfil === "gerente") {
      where.AgenciaId = req.userAgenciaId;
    }

    if (req.userPerfil === "usuario") {
      where.UserId = req.userId;
    }

    const result = await VendaMeta.findOne({
      where,
      attributes: [
        [fn("SUM", col("valorMeta")), "meta"],
        [fn("SUM", col("valorRealizado")), "realizado"],
      ],
    });

    const meta = Number(result.get("meta") || 0);
    const realizado = Number(result.get("realizado") || 0);

    return res.json({
      meta,
      realizado,
      percentual: meta > 0 ? ((realizado / meta) * 100).toFixed(2) : 0,
    });
  },

  // 2️⃣ Performance por agência
  async porAgencia(req, res) {
    if (req.userPerfil === "usuario") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const where = {};
    if (req.userPerfil === "gerente") {
      where.id = req.userAgenciaId;
    }

    const data = await Agencia.findAll({
      where,
      attributes: [
        "nome",
        [fn("SUM", col("VendaMetas.valorMeta")), "meta"],
        [fn("SUM", col("VendaMetas.valorRealizado")), "realizado"],
      ],
      include: [{ model: VendaMeta, attributes: [] }],
      group: ["Agencia.id"],
    });

    return res.json(data);
  },

  // 3️⃣ Performance por produto
  async porProduto(req, res) {
    const where = {};

    if (req.userPerfil === "gerente") {
      where.AgenciaId = req.userAgenciaId;
    }

    if (req.userPerfil === "usuario") {
      where.UserId = req.userId;
    }

    const data = await VendaMeta.findAll({
      where,
      attributes: [
        "produto",
        [fn("SUM", col("valorMeta")), "meta"],
        [fn("SUM", col("valorRealizado")), "realizado"],
      ],
      group: ["produto"],
    });

    return res.json(data);
  },

  // 4️⃣ Ranking de agências
  async rankingAgencias(req, res) {
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Somente admin" });
    }

    const data = await Agencia.findAll({
      attributes: [
        "nome",
        [
          literal(
            '(SUM("VendaMetas"."valorRealizado") / NULLIF(SUM("VendaMetas"."valorMeta"),0)) * 100',
          ),
          "performance",
        ],
      ],
      include: [{ model: VendaMeta, attributes: [] }],
      group: ["Agencia.id"],
      order: [[literal("performance"), "DESC"]],
    });

    return res.json(data);
  },

  // 5️⃣ Resumo mensal
  async mensal(req, res) {
    const { ano } = req.query;
    const where = { ano };

    if (req.userPerfil === "gerente") {
      where.AgenciaId = req.userAgenciaId;
    }

    if (req.userPerfil === "usuario") {
      where.UserId = req.userId;
    }

    const data = await VendaMeta.findAll({
      where,
      attributes: [
        "mes",
        [fn("SUM", col("valorMeta")), "meta"],
        [fn("SUM", col("valorRealizado")), "realizado"],
      ],
      group: ["mes"],
      order: [["mes", "ASC"]],
    });

    return res.json(data);
  },
};
