const xlsx = require("xlsx");
const { VendaMeta, Agencia, Produto, sequelize } = require("../models");

function excelDateToISO(excelDate) {
  if (!excelDate) return null;

  // Excel epoch starts at 1899-12-30.
  const utc_days = Math.floor(excelDate - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  return date_info.toISOString().split("T")[0]; // YYYY-MM-DD
}

module.exports = {
  async importarMetas(req, res) {
    // Ensure only admins can import data.
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Apenas admin pode importar" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado" });
    }

    const transaction = await sequelize.transaction();

    try {
      const userId = req.userId;

      // Read uploaded file from memory.
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet);

      if (!rows.length) {
        await transaction.rollback();
        return res.status(400).json({ error: "Planilha vazia" });
      }

      const relatorio = {
        inseridos: 0,
        atualizados: 0,
        criadas: 0,
        ignorados: 0,
        erros: [],
      };

      for (let i = 0; i < rows.length; i++) {
        const linhaExcel = i + 2; // Header is row 1.
        const row = rows[i];

        const { data_ref, cod_ag, nome_ag, produto, meta, vendas } = row;
        const nomeProduto = String(produto).trim().toUpperCase();
        const dataConvertida = excelDateToISO(data_ref);

        // Minimal required fields validation.
        if (!data_ref || !cod_ag || !produto) {
          relatorio.erros.push({
            linha: linhaExcel,
            erro: "Campos obrigatórios ausentes",
          });
          relatorio.ignorados++;
          continue;
        }

        let produtoDb = await Produto.findOne({
          where: { nome: nomeProduto },
          transaction,
        });

        if (!produtoDb) {
          produtoDb = await Produto.create(
            { nome: nomeProduto },
            { transaction },
          );
        }

        // Normalize agency code to a 4-digit string.
        const codigoAgencia = String(cod_ag).padStart(4, "0");

        // Find agency by code.
        let agencia = await Agencia.findOne({
          where: { codigo: codigoAgencia },
          transaction,
        });

        // Create agency if it does not exist.
        if (!agencia) {
          agencia = await Agencia.create(
            {
              codigo: codigoAgencia,
              nome: nome_ag || `Agência ${codigoAgencia}`,
            },
            { transaction },
          );
          relatorio.criadas++;
        }

        await VendaMeta.upsert(
          {
            data: dataConvertida,
            produtoId: produtoDb.id,
            valorMeta: Number(meta) || 0,
            valorRealizado: Number(vendas) || 0,
            agenciaId: agencia.id,
            UserId: userId,
          },
          { transaction },
        );
      }

      await transaction.commit();

      return res.json({
        message: "Importação concluída com sucesso",
        relatorio,
      });
    } catch (err) {
      await transaction.rollback();
      console.error("Erro no upload:", err);

      return res.status(500).json({
        error: "Erro ao importar planilha",
        details: err.message,
      });
    }
  },
};
