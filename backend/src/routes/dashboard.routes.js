const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const DashboardController = require("../controllers/DashboardController");

// todas rotas exigem login
router.use(auth);

/* ================= ROTAS REAIS DO DASHBOARD ================= */

// cards principais
router.get("/resumo-atual", DashboardController.resumoAtual);

// ranking de agências (valor realizado)
router.get("/ranking-agencias", DashboardController.rankingAgencias);

// produtos ativos
router.get("/produtos-ativos", DashboardController.produtosAtivos);

// evolução de vendas (gráfico)
router.get("/evolucao-vendas", DashboardController.evolucaoVendas);

// compatibilidade com rota antiga
router.get("/evolucao-comparativa", DashboardController.evolucaoVendas);

// períodos disponíveis (somente leitura)
router.get("/periodos", DashboardController.listarPeriodos);

module.exports = router;
