const express = require("express");
const authMiddleware = require("../middlewares/auth");
const DashboardController = require("../controllers/DashboardController");

const router = express.Router();

router.get("/resumo", authMiddleware, DashboardController.resumoGeral);
router.get("/por-agencia", authMiddleware, DashboardController.porAgencia);
router.get("/por-produto", authMiddleware, DashboardController.porProduto);
router.get("/mensal", authMiddleware, DashboardController.mensal);
router.get(
  "/ranking-agencias",
  authMiddleware,
  DashboardController.rankingAgencias,
);

module.exports = router;
