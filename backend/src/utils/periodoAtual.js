const { Periodo } = require("../models");
const { Op } = require("sequelize");

async function obterPeriodoAtual() {
  const hoje = new Date();

  // remove hora/minuto/segundo (CRUCIAL)
  hoje.setHours(0, 0, 0, 0);

  const periodo = await Periodo.findOne({
    where: {
      dataInicio: { [Op.lte]: hoje },
      dataFim: { [Op.gte]: hoje },
    },
  });

  return periodo;
}

module.exports = obterPeriodoAtual;
