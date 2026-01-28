const express = require("express");
const db = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const agenciaRoutes = require("./routes/agencia.routes");

require("./models");
require("dotenv").config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Bank Analytics rodando 🚀");
});

const PORT = process.env.PORT || 5000;

db.authenticate()
  .then(() => {
    console.log("✅ Conectado ao PostgreSQL");
    return db.sync();
  })
  .then(() => {
    app.use("/agencias", agenciaRoutes);
    app.use("/users", userRoutes);
    app.use("/auth", authRoutes);
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no banco:", err);
  });
