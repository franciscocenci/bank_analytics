const express = require("express");
const app = express();
const { sequelize } = require("./models");
const importRoutes = require("./routes/import.routes");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Bank Analytics rodando 🚀");
});

// 👇 ROTAS
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/import", importRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado ao PostgreSQL");

    await sequelize.sync({ alter: true });
    console.log("📦 Tabelas sincronizadas");

    app.listen(5000, () => {
      console.log("🚀 Servidor rodando na porta 5000");
    });
  } catch (err) {
    console.error("❌ Erro ao iniciar servidor:", err);
  }
})();
