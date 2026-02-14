const xlsx = require("xlsx");
const crypto = require("crypto");
const { ImportJob, VendaMeta, Agencia, Produto, sequelize } = require("../models");

async function criarJob(userId) {
  const jobId = crypto.randomUUID();
  await ImportJob.create({
    id: jobId,
    status: "processando",
    percentual: 0,
    processadas: 0,
    total: 0,
    relatorio: {
      inseridos: 0,
      atualizados: 0,
      criadas: 0,
      ignorados: 0,
      erros: [],
    },
    message: "Importação iniciada",
    userId,
  });

  return jobId;
}

async function atualizarJob(jobId, patch) {
  await ImportJob.update(patch, { where: { id: jobId } });
}

function excelDateToISO(excelDate) {
  if (!excelDate) return null;

  // Excel epoch starts at 1899-12-30.
  const utc_days = Math.floor(excelDate - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  return date_info.toISOString().split("T")[0]; // YYYY-MM-DD
}

async function processarImportacao({ jobId, file, userId }) {
  const transaction = await sequelize.transaction();
  let relatorio = {
    inseridos: 0,
    atualizados: 0,
    criadas: 0,
    ignorados: 0,
    erros: [],
  };

  try {
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) {
      await atualizarJob(jobId, {
        status: "erro",
        message: "Planilha vazia",
      });
      await transaction.rollback();
      return;
    }

    await atualizarJob(jobId, { total: rows.length });

    for (let i = 0; i < rows.length; i++) {
      const linhaExcel = i + 2; // Header is row 1.
      const row = rows[i];

      const { data_ref, cod_ag, nome_ag, produto, meta, vendas } = row;
      const nomeProduto = String(produto).trim().toUpperCase();
      const dataConvertida = excelDateToISO(data_ref);

      if (!data_ref || !cod_ag || !produto) {
        relatorio.erros.push({
          linha: linhaExcel,
          erro: "Campos obrigatórios ausentes",
        });
        relatorio.ignorados++;
        await atualizarJob(jobId, { relatorio });
        continue;
      }

      let produtoDb = await Produto.findOne({
        where: { nome: nomeProduto },
        transaction,
      });

      if (!produtoDb) {
        produtoDb = await Produto.create({ nome: nomeProduto }, { transaction });
      }

      const codigoAgencia = String(cod_ag).padStart(4, "0");

      let agencia = await Agencia.findOne({
        where: { codigo: codigoAgencia },
        transaction,
      });

      if (!agencia) {
        agencia = await Agencia.create(
          {
            codigo: codigoAgencia,
            nome: nome_ag || `Agência ${codigoAgencia}`,
          },
          { transaction },
        );
        relatorio.criadas++;
        await atualizarJob(jobId, { relatorio });
      }

      const dadosVenda = {
        data: dataConvertida,
        produtoId: produtoDb.id,
        valorMeta: Number(meta) || 0,
        valorRealizado: Number(vendas) || 0,
        agenciaId: agencia.id,
        userId,
      };

      const existente = await VendaMeta.findOne({
        where: {
          data: dataConvertida,
          produtoId: produtoDb.id,
          agenciaId: agencia.id,
        },
        transaction,
      });

      if (existente) {
        await existente.update(dadosVenda, { transaction });
        relatorio.atualizados++;
        await atualizarJob(jobId, { relatorio });
      } else {
        await VendaMeta.create(dadosVenda, { transaction });
        relatorio.inseridos++;
        await atualizarJob(jobId, { relatorio });
      }

      const processadas = i + 1;
      const total = rows.length;
      const percentual = total ? Math.round((processadas / total) * 100) : 0;
      await atualizarJob(jobId, {
        processadas,
        total,
        percentual,
      });
    }

    await transaction.commit();
    await atualizarJob(jobId, {
      status: "concluido",
      percentual: 100,
      relatorio,
      message: "Importação concluída com sucesso",
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Erro no upload:", err);
    await atualizarJob(jobId, {
      status: "erro",
      message: "Erro ao importar planilha",
      error: err.message,
      relatorio,
    });
  }
}

module.exports = {
  async importarMetas(req, res) {
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Apenas admin pode importar" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado" });
    }

    const userId = req.userId;
    const jobId = await criarJob(userId);

    setImmediate(() => {
      processarImportacao({ jobId, file: req.file, userId });
    });

    return res.json({
      message: "Importação iniciada",
      jobId,
    });
  },

  async statusImportacao(req, res) {
    const { jobId } = req.params;
    const job = await ImportJob.findByPk(jobId);

    if (!job) {
      return res.status(404).json({ error: "Importação não encontrada" });
    }

    return res.json(job);
  },

  async listarImportacoes(req, res) {
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Apenas admin pode consultar" });
    }

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const offset = (page - 1) * limit;
    const status = typeof req.query.status === "string" ? req.query.status : "";
    const where = {};

    if (status && status !== "todos") {
      where.status = status;
    }

    const { rows, count } = await ImportJob.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      where,
      attributes: [
        "id",
        "status",
        "percentual",
        "processadas",
        "total",
        "message",
        "error",
        "createdAt",
        "updatedAt",
      ],
    });

    const pages = Math.max(Math.ceil(count / limit), 1);

    return res.json({
      items: rows,
      total: count,
      page,
      pages,
    });
  },
};
