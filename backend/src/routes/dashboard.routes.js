const express = require("express");
const DashboardController = require("../controllers/DashboardController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.get(
  "/evolucao-comparativa",
  authMiddleware,
  DashboardController.evolucaoComparativa,
);

router.get(
  "/ranking-agencias",
  authMiddleware,
  DashboardController.rankingAgencias,
);

router.get(
  "/ranking-agencias-por-percentual",
  authMiddleware,
  DashboardController.rankingAgenciasPorPercentual,
);

router.get(
  "/evolucao-ranking-agencia",
  authMiddleware,
  DashboardController.evolucaoRankingAgencia,
);

module.exports = router;
