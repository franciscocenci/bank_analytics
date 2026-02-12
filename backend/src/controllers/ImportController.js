const xlsx = require("xlsx");
const crypto = require("crypto");
const { VendaMeta, Agencia, Produto, sequelize } = require("../models");

const importJobs = new Map();
const JOB_TTL_MS = 1000 * 60 * 30;

function criarJob() {
  const id = crypto.randomUUID();
  importJobs.set(id, {
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
    updatedAt: Date.now(),
  });
  return id;
}

function atualizarJob(jobId, patch) {
  const job = importJobs.get(jobId);
  if (!job) return null;
  const atualizado = { ...job, ...patch, updatedAt: Date.now() };
  importJobs.set(jobId, atualizado);
  return atualizado;
}

function finalizarJob(jobId) {
  setTimeout(() => {
    importJobs.delete(jobId);
  }, JOB_TTL_MS);
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

  try {
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) {
      atualizarJob(jobId, {
        status: "erro",
        message: "Planilha vazia",
      });
      await transaction.rollback();
      finalizarJob(jobId);
      return;
    }

    atualizarJob(jobId, { total: rows.length });

    for (let i = 0; i < rows.length; i++) {
      const linhaExcel = i + 2; // Header is row 1.
      const row = rows[i];

      const { data_ref, cod_ag, nome_ag, produto, meta, vendas } = row;
      const nomeProduto = String(produto).trim().toUpperCase();
      const dataConvertida = excelDateToISO(data_ref);

      if (!data_ref || !cod_ag || !produto) {
        const job = importJobs.get(jobId);
        job.relatorio.erros.push({
          linha: linhaExcel,
          erro: "Campos obrigatórios ausentes",
        });
        job.relatorio.ignorados++;
        atualizarJob(jobId, {
          relatorio: job.relatorio,
        });
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
        const job = importJobs.get(jobId);
        job.relatorio.criadas++;
        atualizarJob(jobId, {
          relatorio: job.relatorio,
        });
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
        const job = importJobs.get(jobId);
        job.relatorio.atualizados++;
        atualizarJob(jobId, {
          relatorio: job.relatorio,
        });
      } else {
        await VendaMeta.create(dadosVenda, { transaction });
        const job = importJobs.get(jobId);
        job.relatorio.inseridos++;
        atualizarJob(jobId, {
          relatorio: job.relatorio,
        });
      }

      const processadas = i + 1;
      const total = rows.length;
      const percentual = total ? Math.round((processadas / total) * 100) : 0;
      atualizarJob(jobId, {
        processadas,
        total,
        percentual,
      });
    }

    await transaction.commit();
    atualizarJob(jobId, {
      status: "concluido",
      percentual: 100,
      message: "Importação concluída com sucesso",
    });
    finalizarJob(jobId);
  } catch (err) {
    await transaction.rollback();
    console.error("Erro no upload:", err);
    atualizarJob(jobId, {
      status: "erro",
      message: "Erro ao importar planilha",
      error: err.message,
    });
    finalizarJob(jobId);
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

    const jobId = criarJob();
    const userId = req.userId;

    setImmediate(() => {
      processarImportacao({ jobId, file: req.file, userId });
    });

    return res.json({
      message: "Importação iniciada",
      jobId,
    });
  },

  async progressoImportacao(req, res) {
    const { jobId } = req.params;
    const job = importJobs.get(jobId);

    if (!job) {
      return res.status(404).json({ error: "Importação não encontrada" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const enviar = () => {
      const payload = importJobs.get(jobId);
      if (!payload) {
        res.write(`data: ${JSON.stringify({ status: "erro", message: "Importação não encontrada" })}\n\n`);
        res.end();
        return;
      }

      res.write(`data: ${JSON.stringify(payload)}\n\n`);

      if (payload.status === "concluido" || payload.status === "erro") {
        clearInterval(intervalId);
        res.end();
      }
    };

    enviar();
    const intervalId = setInterval(enviar, 400);

    req.on("close", () => {
      clearInterval(intervalId);
    });
  },
};
