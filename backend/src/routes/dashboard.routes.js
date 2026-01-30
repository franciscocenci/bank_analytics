const express = require("express");
const routes = express.Router();

const DashboardController = require("../controllers/DashboardController");

// 📊 Evolução de vendas
routes.get("/evolucao", DashboardController.evolucao);

module.exports = routes;
