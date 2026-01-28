const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Bank Analytics rodando 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
