const xlsx = require("xlsx");
const { VendaMeta, Agencia, sequelize } = require("../models");

module.exports = {
  async importarMetas(req, res) {
    // 🔐 Garantia extra
    if (req.userPerfil !== "admin") {
      return res.status(403).json({ error: "Apenas admin pode importar" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado" });
    }

    const transaction = await sequelize.transaction();

    try {
      const userId = req.userId;

      // 📖 Ler arquivo do upload (buffer)
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
        const linhaExcel = i + 2; // cabeçalho é linha 1
        const row = rows[i];

        const { data_ref, cod_ag, nome_ag, produto, meta, vendas } = row;

        // 🔎 Validação mínima
        if (!data_ref || !cod_ag || !produto) {
          relatorio.erros.push({
            linha: linhaExcel,
            erro: "Campos obrigatórios ausentes",
          });
          relatorio.ignorados++;
          continue;
        }

        // 🏦 Normaliza código da agência (sempre STRING com 4 dígitos)
        const codigoAgencia = String(cod_ag).padStart(4, "0");

        // 🔍 Busca agência
        let agencia = await Agencia.findOne({
          where: { codigo: codigoAgencia },
          transaction,
        });

        // 🆕 AUTOCADASTRO DE AGÊNCIA
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

        // 🔁 Verifica se já existe venda (data + produto + agência)
        const existente = await VendaMeta.findOne({
          where: {
            data: data_ref,
            produto,
            AgenciaId: agencia.id,
          },
          transaction,
        });

        if (existente) {
          await existente.update(
            {
              valorMeta: Number(meta) || 0,
              valorRealizado: Number(vendas) || 0,
              UserId: userId,
            },
            { transaction },
          );
          relatorio.atualizados++;
        } else {
          await VendaMeta.create(
            {
              data: data_ref,
              produto,
              valorMeta: Number(meta) || 0,
              valorRealizado: Number(vendas) || 0,
              AgenciaId: agencia.id,
              UserId: userId,
            },
            { transaction },
          );
          relatorio.inseridos++;
        }
      }

      await transaction.commit();

      return res.json({
        message: "Importação concluída com sucesso",
        relatorio,
      });
    } catch (err) {
      await transaction.rollback();
      console.error("❌ Erro no upload:", err);

      return res.status(500).json({
        error: "Erro ao importar planilha",
        details: err.message,
      });
    }
  },
};
