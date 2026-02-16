const {
  VendaMeta,
  Agencia,
  Periodo,
  Produto,
  Sequelize,
  sequelize,
} = require("../models");

const obterPeriodoAtual = require("../utils/periodoAtual");
const { Op } = require("sequelize");

/* ---------------------------------------------------------
Util
--------------------------------------------------------- */
function numeroSeguro(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) return 0;
  return Number(valor);
}

/* ---------------------------------------------------------
Helper: filtro por produto (JOIN correto)
--------------------------------------------------------- */
function includeProduto(produto) {
  const include = {
    model: Produto,
    as: "produto",
    attributes: [],
  };

  if (produto && produto !== "todos") {
    include.where = { nome: produto };
  }

  return include;
}

function parseDateOnly(dateStr) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T00:00:00Z`);
}

function formatDateOnly(date) {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

async function carregarPeriodo(periodoId) {
  if (!periodoId) return null;
  return Periodo.findByPk(periodoId);
}

async function obterMensuracaoProduto(nomeProduto) {
  if (!nomeProduto || nomeProduto === "todos") return "volume";
  const produto = await Produto.findOne({ where: { nome: nomeProduto } });
  return produto?.mensuracao || "volume";
}

async function obterPeriodoBase(periodoId) {
  if (periodoId) {
    return carregarPeriodo(periodoId);
  }
  return obterPeriodoAtual();
}

async function vendasPorDia(periodo, whereBase, produto) {
  const where = {
    ...whereBase,
    data: {
      [Op.between]: [periodo.dataInicio, periodo.dataFim],
    },
  };

  const vendas = await VendaMeta.findAll({
    where,
    include: [includeProduto(produto)],
    attributes: [
      [Sequelize.fn("DATE", Sequelize.col("data")), "dia"],
      [Sequelize.fn("SUM", Sequelize.col("valorRealizado")), "totalDia"],
    ],
    group: [Sequelize.fn("DATE", Sequelize.col("data"))],
    order: [[Sequelize.fn("DATE", Sequelize.col("data")), "ASC"]],
    raw: true,
  });

  return vendas.map((v) => ({
    dia: v.dia,
    valor: Number(v.totalDia),
  }));
}

async function obterUltimaData(periodo, whereBase) {
  const where = {
    ...whereBase,
    data: {
      [Op.between]: [periodo.dataInicio, periodo.dataFim],
    },
  };

  return VendaMeta.max("data", { where });
}

async function obterUltimaDataProduto(periodo, whereBase, produto) {
  const where = {
    ...whereBase,
    data: {
      [Op.between]: [periodo.dataInicio, periodo.dataFim],
    },
  };

  return VendaMeta.max("data", {
    where,
    include: [includeProduto(produto)],
  });
}

/* =========================================================
PRODUTOS ATIVOS DO PERÍODO
========================================================= */
async function produtosAtivos(req, res) {
  try {
    const { periodoId } = req.query;
    const periodo = await obterPeriodoBase(periodoId);

    if (!periodo) {
      return res.status(404).json({ erro: "Nenhum período vigente" });
    }

    const produtos = await VendaMeta.findAll({
      attributes: [[Sequelize.col("produto.nome"), "nome"]],
      include: [
        {
          model: Produto,
          as: "produto",
          attributes: [],
        },
      ],
      where: {
        data: {
          [Op.between]: [periodo.dataInicio, periodo.dataFim],
        },
      },
      group: ["produto.nome", "produto.mensuracao"],
      order: [[Sequelize.col("produto.nome"), "ASC"]],
      raw: true,
    });

    return res.json(produtos.map((p) => p.nome));
  } catch (err) {
    console.error("Erro produtos ativos:", err);
    return res.status(500).json({ erro: "Erro ao buscar produtos ativos" });
  }
}

/* =========================================================
RESUMO ATUAL
========================================================= */
async function resumoAtual(req, res) {
  try {
    const { periodoId, agenciaId } = req.query;
    const periodo = await obterPeriodoBase(periodoId);

    if (!periodo) {
      return res.status(404).json({
        error: "Nenhum período vigente encontrado para a data atual",
      });
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const inicio = new Date(periodo.dataInicio);
    const fim = new Date(periodo.dataFim);

    const diasTotais = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;
    const diasDecorridosBruto =
      Math.ceil((hoje - inicio) / (1000 * 60 * 60 * 24)) + 1;
    const diasDecorridos = Math.min(
      Math.max(diasDecorridosBruto, 0),
      diasTotais,
    );
    const diasRestantes = Math.max(diasTotais - diasDecorridos, 0);

    const whereBase = {};

    if (req.userPerfil !== "admin") {
      if (!req.userAgenciaId) {
        return res.status(400).json({
          error: "Usuário sem agência vinculada",
        });
      }
      whereBase.agenciaId = req.userAgenciaId;
    } else if (agenciaId && agenciaId !== "todas") {
      whereBase.agenciaId = agenciaId;
    }

    const ultimaData = await obterUltimaData(periodo, whereBase);

    if (!ultimaData) {
      return res.json({
        periodo: {
          dataInicio: periodo.dataInicio,
          dataFim: periodo.dataFim,
          diasTotais,
          diasDecorridos,
          diasRestantes,
        },
        produtos: [],
      });
    }

    const where = {
      ...whereBase,
      data: ultimaData,
    };

    const vendas = await VendaMeta.findAll({
      attributes: [
        [Sequelize.col("produto.nome"), "produto"],
        [Sequelize.col("produto.mensuracao"), "mensuracao"],
        [sequelize.fn("SUM", sequelize.col("valorMeta")), "meta"],
        [sequelize.fn("SUM", sequelize.col("valorRealizado")), "realizado"],
      ],
      include: [
        {
          model: Produto,
          as: "produto",
          attributes: [],
        },
      ],
      where,
      group: ["produto.nome", "produto.mensuracao"],
      raw: true,
    });

    const produtos = vendas.map((p) => {
      const meta = numeroSeguro(p.meta);
      const realizado = numeroSeguro(p.realizado);

      const faltante = Math.max(meta - realizado, 0);
      const atingimento = meta > 0 ? (realizado / meta) * 100 : 0;
      const esforcoDiario = diasRestantes > 0 ? faltante / diasRestantes : 0;

      return {
        produto: p.produto,
        mensuracao: p.mensuracao || "volume",
        meta,
        realizado,
        atingimento: Number(atingimento.toFixed(2)),
        faltante,
        esforcoDiarioNecessario: Number(esforcoDiario.toFixed(2)),
      };
    });

    return res.json({
      periodo: {
        dataInicio: periodo.dataInicio,
        dataFim: periodo.dataFim,
        diasTotais,
        diasDecorridos,
        diasRestantes,
      },
      produtos,
    });
  } catch (err) {
    console.error("Erro dashboard atual:", err);
    return res.status(500).json({ error: "Erro ao gerar dashboard atual" });
  }
}

/* =========================================================
RANKING DE AGÊNCIAS
========================================================= */
async function rankingAgencias(req, res) {
  try {
    const { produto, orderBy = "valor", periodoId } = req.query;
    const periodo = await obterPeriodoBase(periodoId);

    if (!periodo) {
      return res.status(404).json({
        error: "Nenhum período vigente encontrado",
      });
    }

    const whereBase = {};

    const ultimaData = await obterUltimaData(periodo, whereBase);

    if (!ultimaData) {
      return res.json({
        produto: produto || "Todos",
        ranking: [],
      });
    }

    const where = {
      ...whereBase,
      data: ultimaData,
    };

    const ranking = await VendaMeta.findAll({
      where,
      include: [
        includeProduto(produto),
        {
          model: Agencia,
          as: "agencia",
          attributes: ["id", "nome", "codigo"],
        },
      ],
      attributes: [
        [Sequelize.col("VendaMeta.AgenciaId"), "agenciaId"],
        [Sequelize.fn("SUM", Sequelize.col("valorMeta")), "meta"],
        [Sequelize.fn("SUM", Sequelize.col("valorRealizado")), "realizado"],
      ],
      group: [
        Sequelize.col("VendaMeta.AgenciaId"),
        "agencia.id",
        "agencia.nome",
        "agencia.codigo",
      ],
      raw: true,
    });

    let resultado = ranking.map((item) => {
      const meta = numeroSeguro(item.meta);
      const realizado = numeroSeguro(item.realizado);

      return {
        agencia: {
          id: item["agencia.id"],
          nome: item["agencia.nome"],
          codigo: item["agencia.codigo"],
        },
        meta,
        realizado,
        percentual:
          meta > 0 ? Number(((realizado / meta) * 100).toFixed(2)) : 0,
      };
    });

    resultado.sort((a, b) =>
      orderBy === "percentual"
        ? b.percentual - a.percentual
        : b.realizado - a.realizado,
    );

    const rankingComPosicao = resultado.map((item, index) => ({
      ...item,
      ranking: index + 1,
    }));

    const mensuracao = await obterMensuracaoProduto(produto);

    return res.json({
      produto: produto || "Todos",
      mensuracao,
      ranking: rankingComPosicao,
    });
  } catch (err) {
    console.error("Erro no ranking de agências:", err);
    return res.status(500).json({
      error: "Erro ao gerar ranking de agências",
    });
  }
}

/* =========================================================
RANKING DE AGENCIAS (TODOS OS PRODUTOS)
========================================================= */
async function rankingAgenciasTodos(req, res) {
  try {
    const { orderBy = "valor", periodoId } = req.query;
    const periodo = await obterPeriodoBase(periodoId);

    if (!periodo) {
      return res.status(404).json({
        error: "Nenhum período vigente encontrado",
      });
    }

    const whereBase = {};
    const ultimaData = await obterUltimaData(periodo, whereBase);

    if (!ultimaData) {
      return res.json({ produtos: {} });
    }

    const where = {
      ...whereBase,
      data: ultimaData,
    };

    const rows = await VendaMeta.findAll({
      where,
      include: [
        {
          model: Produto,
          as: "produto",
          attributes: [],
        },
        {
          model: Agencia,
          as: "agencia",
          attributes: [],
        },
      ],
      attributes: [
        [Sequelize.col("produto.nome"), "produtoNome"],
        [Sequelize.col("produto.mensuracao"), "produtoMensuracao"],
        [Sequelize.col("agencia.id"), "agenciaId"],
        [Sequelize.col("agencia.nome"), "agenciaNome"],
        [Sequelize.col("agencia.codigo"), "agenciaCodigo"],
        [Sequelize.fn("SUM", Sequelize.col("valorMeta")), "meta"],
        [Sequelize.fn("SUM", Sequelize.col("valorRealizado")), "realizado"],
      ],
      group: [
        "produto.id",
        "produto.nome",
        "produto.mensuracao",
        "agencia.id",
        "agencia.nome",
        "agencia.codigo",
      ],
      raw: true,
    });

    const produtos = {};

    rows.forEach((item) => {
      const produtoNome = item.produtoNome || "";
      if (!produtoNome) return;

      if (!produtos[produtoNome]) {
        produtos[produtoNome] = {
          mensuracao: item.produtoMensuracao || "volume",
          ranking: [],
        };
      }

      const meta = numeroSeguro(item.meta);
      const realizado = numeroSeguro(item.realizado);

      produtos[produtoNome].ranking.push({
        agencia: {
          id: item.agenciaId,
          nome: item.agenciaNome,
          codigo: item.agenciaCodigo,
        },
        meta,
        realizado,
        percentual: meta > 0 ? Number(((realizado / meta) * 100).toFixed(2)) : 0,
      });
    });

    Object.values(produtos).forEach((produto) => {
      produto.ranking.sort((a, b) =>
        orderBy === "percentual"
          ? b.percentual - a.percentual
          : b.realizado - a.realizado,
      );

      produto.ranking = produto.ranking.map((item, index) => ({
        ...item,
        ranking: index + 1,
      }));
    });

    return res.json({ produtos });
  } catch (err) {
    console.error("Erro no ranking de agências (todos):", err);
    return res.status(500).json({
      error: "Erro ao gerar ranking de agências",
    });
  }
}

/* =========================================================
EVOLUÇÃO DE VENDAS
========================================================= */
async function evolucaoVendas(req, res) {
  try {
    const { produto, agenciaId, periodoId, comparacaoId } = req.query;
    const perfil = req.userPerfil;
    const userAgenciaId = req.userAgenciaId;

    if (!produto) {
      return res.status(400).json({ error: "Produto é obrigatório" });
    }

    const periodoAtual = await obterPeriodoBase(periodoId);

    if (!periodoAtual) {
      return res.status(404).json({ error: "Período atual não encontrado" });
    }

    const whereBase = {};

    if (perfil !== "admin") {
      if (!userAgenciaId) {
        return res.status(400).json({
          error: "Usuário sem agência vinculada",
        });
      }
      whereBase.agenciaId = userAgenciaId;
    } else if (agenciaId && agenciaId !== "todas") {
      whereBase.agenciaId = agenciaId;
    }

    const linhaAtual = await vendasPorDia(periodoAtual, whereBase, produto);

    const ultimaDataProduto = await obterUltimaDataProduto(
      periodoAtual,
      whereBase,
      produto,
    );

    const meta = ultimaDataProduto
      ? await VendaMeta.sum("valorMeta", {
          where: {
            ...whereBase,
            data: ultimaDataProduto,
          },
          include: [includeProduto(produto)],
        })
      : 0;

    let linhaComparacao = [];
    let periodoComparacao = null;

    if (comparacaoId) {
      periodoComparacao = await carregarPeriodo(comparacaoId);

      if (!periodoComparacao) {
        return res
          .status(404)
          .json({ error: "Período de comparação inválido" });
      }

      linhaComparacao = await vendasPorDia(
        periodoComparacao,
        whereBase,
        produto,
      );

      const inicioAtual = parseDateOnly(periodoAtual.dataInicio);
      const inicioComparacao = parseDateOnly(periodoComparacao.dataInicio);

      if (inicioAtual && inicioComparacao) {
        linhaComparacao = linhaComparacao.map((item) => {
          const dataItem = parseDateOnly(item.dia);
          const diffDias = Math.round(
            (dataItem - inicioComparacao) / (1000 * 60 * 60 * 24),
          );
          const dataAlinhada = new Date(inicioAtual);
          dataAlinhada.setUTCDate(dataAlinhada.getUTCDate() + diffDias);

          return {
            ...item,
            dia: formatDateOnly(dataAlinhada),
          };
        });
      }
    }

    const mensuracao = await obterMensuracaoProduto(produto);

    return res.json({
      produto,
      mensuracao,
      atual: linhaAtual,
      comparacao: linhaComparacao,
      meta: numeroSeguro(meta),
      periodoAtual: {
        dataInicio: periodoAtual.dataInicio,
        dataFim: periodoAtual.dataFim,
      },
      periodoComparacao: periodoComparacao
        ? {
            dataInicio: periodoComparacao.dataInicio,
            dataFim: periodoComparacao.dataFim,
          }
        : null,
    });
  } catch (err) {
    console.error("Erro evolução vendas:", err);
    return res.status(500).json({
      error: "Erro ao gerar evolução de vendas",
    });
  }
}

/* =========================================================
LISTAGEM DE PERÍODOS
========================================================= */
async function listarPeriodos(req, res) {
  try {
    const periodos = await Periodo.findAll({
      order: [["dataInicio", "DESC"]],
    });

    return res.json(periodos);
  } catch (err) {
    console.error("Erro ao listar períodos:", err);
    return res.status(500).json({ error: "Erro ao listar períodos" });
  }
}

/* =========================================================
EXPORTS
========================================================= */
module.exports = {
  produtosAtivos,
  resumoAtual,
  rankingAgencias,
  rankingAgenciasTodos,
  evolucaoVendas,
  listarPeriodos,
};
