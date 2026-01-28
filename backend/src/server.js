const express = require("express");
const db = require("./config/database");
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
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no banco:", err);
  });
