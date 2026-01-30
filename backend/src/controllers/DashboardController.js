const { VendaMeta, Agencia, Sequelize } = require("../models");
const { Op } = Sequelize;

module.exports = {
  async evolucaoComparativa(req, res) {
    try {
      // 🔐 Dados do usuário logado (middleware)
      const perfil = req.userPerfil;
      const agenciaUsuarioId = req.userAgenciaId;

      // 📥 Query params
      const { ano, mes, produto, agenciaId, todasAgencias } = req.query;

      if (!ano || !mes) {
        return res.status(400).json({
          error: "Informe ano e mês para comparação",
        });
      }

      const anoBase = Number(ano);
      const mesBase = Number(mes);

      // 📊 Ano atual + 2 anteriores
      const anosComparacao = [anoBase, anoBase - 1, anoBase - 2];

      // 🧠 Filtro base
      const where = {
        data: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn("EXTRACT", Sequelize.literal('YEAR FROM "data"')),
              { [Op.in]: anosComparacao },
            ),
            Sequelize.where(
              Sequelize.fn("EXTRACT", Sequelize.literal('MONTH FROM "data"')),
              mesBase,
            ),
          ],
        },
      };

      // 🎯 Produto (opcional)
      if (produto && produto !== "todos") {
        where.produto = produto;
      }

      // 🏦 Agência
      if (perfil === "admin") {
        if (!todasAgencias && agenciaId) {
          where.AgenciaId = agenciaId;
        }
      } else {
        // usuário comum só vê a própria agência
        where.AgenciaId = agenciaUsuarioId;
      }

      // 📦 Consulta
      const resultados = await VendaMeta.findAll({
        where,
        attributes: [
          [
            Sequelize.fn("EXTRACT", Sequelize.literal('YEAR FROM "data"')),
            "ano",
          ],
          [Sequelize.fn("SUM", Sequelize.col("valorMeta")), "meta"],
          [Sequelize.fn("SUM", Sequelize.col("valorRealizado")), "realizado"],
        ],
        group: ["ano"],
        order: [[Sequelize.literal("ano"), "ASC"]],
        raw: true,
      });

      // 📈 Formatação
      const dados = resultados.map((item) => {
        const meta = Number(item.meta) || 0;
        const realizado = Number(item.realizado) || 0;

        return {
          ano: Number(item.ano),
          meta,
          realizado,
          percentual:
            meta > 0 ? Number(((realizado / meta) * 100).toFixed(2)) : 0,
        };
      });

      return res.json({
        periodo: {
          mes: mesBase,
          anos: anosComparacao,
        },
        produto: produto || "Todos",
        dados,
      });
    } catch (err) {
      console.error("❌ Erro no dashboard comparativo:", err);
      return res.status(500).json({
        error: "Erro ao gerar dashboard comparativo",
      });
    }
  },

  async rankingAgencias(req, res) {
    try {
      const perfil = req.userPerfil;
      const userAgenciaId = req.userAgenciaId;

      const { ano, mes, produto, orderBy = "valor" } = req.query;

      if (!ano || !mes) {
        return res.status(400).json({
          error: "Informe ano e mês para gerar o ranking",
        });
      }

      const anoNum = Number(ano);
      const mesNum = Number(mes);

      const where = {
        data: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn("EXTRACT", Sequelize.literal('YEAR FROM "data"')),
              anoNum,
            ),
            Sequelize.where(
              Sequelize.fn("EXTRACT", Sequelize.literal('MONTH FROM "data"')),
              mesNum,
            ),
          ],
        },
      };

      if (produto && produto !== "todos") {
        where.produto = produto;
      }

      // 👤 usuário comum vê só a própria agência
      if (perfil !== "admin") {
        where.AgenciaId = userAgenciaId;
      }

      const ranking = await VendaMeta.findAll({
        where,
        attributes: [
          "AgenciaId",
          [Sequelize.fn("SUM", Sequelize.col("valorMeta")), "meta"],
          [Sequelize.fn("SUM", Sequelize.col("valorRealizado")), "realizado"],
        ],
        include: [
          {
            model: Agencia, // ⚠️ SEM alias
            attributes: ["id", "nome", "codigo"],
          },
        ],
        group: ["VendaMeta.AgenciaId", "Agencium.id"],
        raw: true,
      });

      let resultado = ranking.map((item) => {
        const meta = Number(item.meta) || 0;
        const realizado = Number(item.realizado) || 0;

        return {
          agencia: {
            id: item["Agencia.id"],
            nome: item["Agencia.nome"],
            codigo: item["Agencia.codigo"],
          },
          meta,
          realizado,
          percentual:
            meta > 0 ? Number(((realizado / meta) * 100).toFixed(2)) : 0,
        };
      });

      // ordena
      if (orderBy === "percentual") {
        resultado.sort((a, b) => b.percentual - a.percentual);
      } else {
        resultado.sort((a, b) => b.realizado - a.realizado);
      }

      // adiciona posição no ranking
      let posicao = 0;
      let ultimoValor = null;

      resultado = resultado.map((item, index) => {
        if (ultimoValor === null || item.realizado < ultimoValor) {
          posicao = index + 1;
        }

        ultimoValor = item.realizado;

        return {
          ranking: posicao,
          ...item,
        };
      });

      let minhaAgencia = null;

      if (perfil !== "admin") {
        minhaAgencia = resultado.find(
          (item) => item.agencia.id === userAgenciaId,
        );
      }

      return res.json({
        periodo: { mes: mesNum, ano: anoNum },
        produto: produto || "Todos",
        minhaAgencia,
        ranking: resultado,
      });
    } catch (err) {
      console.error("❌ Erro no ranking de agências:", err);
      return res.status(500).json({
        error: "Erro ao gerar ranking de agências",
      });
    }
  },

  async rankingAgenciasPorPercentual(req, res) {
    try {
      const perfil = req.userPerfil;
      const userAgenciaId = req.userAgenciaId;
      const { ano, mes, produto } = req.query;

      if (!ano || !mes) {
        return res.status(400).json({
          error: "Informe ano e mês para gerar o ranking",
        });
      }

      const anoNum = Number(ano);
      const mesNum = Number(mes);

      const where = {
        data: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn("EXTRACT", Sequelize.literal('YEAR FROM "data"')),
              anoNum,
            ),
            Sequelize.where(
              Sequelize.fn("EXTRACT", Sequelize.literal('MONTH FROM "data"')),
              mesNum,
            ),
          ],
        },
      };

      if (produto && produto !== "todos") {
        where.produto = produto;
      }

      if (perfil !== "admin") {
        where.AgenciaId = userAgenciaId;
      }

      const dados = await VendaMeta.findAll({
        where,
        attributes: [
          "AgenciaId",
          [Sequelize.fn("SUM", Sequelize.col("valorMeta")), "meta"],
          [Sequelize.fn("SUM", Sequelize.col("valorRealizado")), "realizado"],
        ],
        include: [
          {
            model: Agencia, // 👈 SEM alias
            attributes: ["id", "nome", "codigo"],
          },
        ],
        group: ["VendaMeta.AgenciaId", "Agencium.id"],
        raw: true,
      });

      const ranking = dados
        .map((item) => {
          const meta = Number(item.meta) || 0;
          const realizado = Number(item.realizado) || 0;

          return {
            meta,
            realizado,
            percentual:
              meta > 0 ? Number(((realizado / meta) * 100).toFixed(2)) : 0,
            agencia: {
              id: item["Agencium.id"],
              nome: item["Agencium.nome"],
              codigo: item["Agencium.codigo"],
            },
          };
        })
        .sort((a, b) => b.percentual - a.percentual);

      let posicao = 0;
      let ultimoPercentual = null;

      const rankingComEmpate = ranking.map((item, index) => {
        if (ultimoPercentual === null || item.percentual < ultimoPercentual) {
          posicao = index + 1;
        }

        ultimoPercentual = item.percentual;

        return {
          ranking: posicao,
          ...item,
        };
      });

      return res.json({
        periodo: { ano: anoNum, mes: mesNum },
        produto: produto || "Todos",
        ranking: rankingComEmpate,
      });
    } catch (err) {
      console.error("❌ Erro no ranking por percentual:", err);
      return res.status(500).json({
        error: "Erro ao gerar ranking por percentual de meta",
      });
    }
  },

  async evolucaoRankingAgencia(req, res) {
    try {
      const { ano, produto } = req.query;
      const perfil = req.userPerfil;
      const userAgenciaId = req.userAgenciaId;

      if (!ano) {
        return res.status(400).json({ error: "Informe o ano" });
      }

      const anoNum = Number(ano);
      const resultadoFinal = [];

      for (let mes = 1; mes <= 12; mes++) {
        const where = {
          data: {
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn("EXTRACT", Sequelize.literal('YEAR FROM "data"')),
                anoNum,
              ),
              Sequelize.where(
                Sequelize.fn("EXTRACT", Sequelize.literal('MONTH FROM "data"')),
                mes,
              ),
            ],
          },
        };

        if (produto && produto !== "todos") {
          where.produto = produto;
        }

        const dados = await VendaMeta.findAll({
          where,
          attributes: [
            "AgenciaId",
            [Sequelize.fn("SUM", Sequelize.col("valorRealizado")), "realizado"],
          ],
          group: ["VendaMeta.AgenciaId"],
          raw: true,
        });

        if (!dados.length) continue;

        // ordena por valor
        const rankingMes = dados
          .map((item) => ({
            AgenciaId: item.AgenciaId,
            realizado: Number(item.realizado) || 0,
          }))
          .sort((a, b) => b.realizado - a.realizado);

        // ranking com empate
        let posicao = 0;
        let ultimoValor = null;

        const rankingComPosicao = rankingMes.map((item, index) => {
          if (ultimoValor === null || item.realizado < ultimoValor) {
            posicao = index + 1;
          }
          ultimoValor = item.realizado;

          return {
            ranking: posicao,
            ...item,
          };
        });

        const minhaPosicao = rankingComPosicao.find(
          (item) => item.AgenciaId === userAgenciaId,
        );

        if (minhaPosicao) {
          resultadoFinal.push({
            mes,
            ranking: minhaPosicao.ranking,
          });
        }
      }

      return res.json({
        ano: anoNum,
        produto: produto || "Todos",
        evolucao: resultadoFinal,
      });
    } catch (err) {
      console.error("❌ Erro na evolução de ranking:", err);
      return res.status(500).json({
        error: "Erro ao gerar evolução do ranking",
      });
    }
  },
};
