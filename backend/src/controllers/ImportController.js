const xlsx = require("xlsx");
const { VendaMeta, Agencia } = require("../models");

module.exports = {
  async importarMetas(req, res) {
    try {
      // 1️⃣ Usuário logado (vem do middleware auth)
      const userId = req.userId;

      // 2️⃣ Caminho do arquivo (por enquanto fixo)
      const workbook = xlsx.readFile("import.xlsx");
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // 3️⃣ Converter Excel em JSON
      const rows = xlsx.utils.sheet_to_json(sheet);

      if (!rows.length) {
        return res.status(400).json({ error: "Planilha vazia" });
      }

      // 4️⃣ Processar linha por linha
      for (const row of rows) {
        const { data_ref, cod_ag, nome_ag, produto, meta, vendas } = row;

        // 🔎 Buscar agência pelo código ou nome
        let agencia = null;

        // 🔹 Se veio código da agência
        if (cod_ag !== undefined && cod_ag !== null) {
          agencia = await Agencia.findOne({
            where: { codigo: String(cod_ag) }, // 👈 CONVERSÃO CRÍTICA
          });
        }

        // 🔹 Se não achou pelo código, tenta pelo nome
        if (!agencia && nome_ag) {
          agencia = await Agencia.findOne({
            where: { nome: nome_ag },
          });
        }

        if (!agencia) {
          console.warn(`Agência não encontrada: ${cod_ag || nome_ag}`);
          continue; // pula linha inválida
        }

        // 🔍 Verifica se já existe registro para:
        // data + produto + agência
        const vendaExistente = await VendaMeta.findOne({
          where: {
            data: data_ref,
            produto,
            AgenciaId: agencia.id,
          },
        });

        // ✅ Se já existir → ATUALIZA
        if (vendaExistente) {
          await vendaExistente.update({
            valorMeta: meta,
            valorRealizado: vendas,
          });
        }
        // 🆕 Se não existir → CRIA
        else {
          await VendaMeta.create({
            data: data_ref,
            produto,
            valorMeta: meta,
            valorRealizado: vendas,
            AgenciaId: agencia.id,
            UserId: userId,
          });
        }
      }

      return res.json({ message: "Importação concluída com sucesso" });
    } catch (err) {
      console.error("❌ Erro ao importar:", err);
      return res.status(500).json({ error: "Erro na importação" });
    }
  },
};
