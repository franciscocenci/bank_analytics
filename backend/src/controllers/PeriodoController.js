const { Periodo } = require("../models");

module.exports = {
  // List periods.
  async index(req, res) {
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const periodos = await Periodo.findAll({
      order: [["dataInicio", "ASC"]],
    });

    return res.json(periodos);
  },

  // Create a period.
  async create(req, res) {
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { dataInicio, dataFim } = req.body;

    if (!dataInicio || !dataFim) {
      return res.status(400).json({
        error: "Data inicial e data final são obrigatórias",
      });
    }

    // End date must be after start date.
    if (new Date(dataFim) <= new Date(dataInicio)) {
      return res.status(400).json({
        error: "A data final deve ser maior que a data inicial",
      });
    }

    // Find the most recent period.
    const ultimoPeriodo = await Periodo.findOne({
      order: [["dataFim", "DESC"]],
    });

    // Start date must not overlap the last period.
    if (
      ultimoPeriodo &&
      new Date(dataInicio) < new Date(ultimoPeriodo.dataFim)
    ) {
      return res.status(400).json({
        error:
          "A data inicial não pode ser menor que a data final do último período",
      });
    }

    const periodo = await Periodo.create({
      dataInicio,
      dataFim,
    });

    return res.status(201).json(periodo);
  },

  // Update a period.
  async update(req, res) {
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { id } = req.params;
    const { dataInicio, dataFim } = req.body;

    const periodo = await Periodo.findByPk(id);

    if (!periodo) {
      return res.status(404).json({ error: "Período não encontrado" });
    }

    if (new Date(dataFim) <= new Date(dataInicio)) {
      return res.status(400).json({
        error: "A data final deve ser maior que a data inicial",
      });
    }

    await periodo.update({
      dataInicio,
      dataFim,
    });

    return res.json(periodo);
  },

  // Delete a period.
  async delete(req, res) {
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { id } = req.params;

    const periodo = await Periodo.findByPk(id);

    if (!periodo) {
      return res.status(404).json({ error: "Período não encontrado" });
    }

    await periodo.destroy();

    return res.status(204).send();
  },
};
