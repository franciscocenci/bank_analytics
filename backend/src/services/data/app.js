const express = require("express");
const cors = require("cors");

const agenciaRoutes = require("../../routes/agencia.routes");
const userRoutes = require("../../routes/user.routes");
const periodoRoutes = require("../../routes/periodo.routes");
const produtoRoutes = require("../../routes/produto.routes");
const importRoutes = require("../../routes/import.routes");
const requestId = require("../../middlewares/requestId");
const requestTiming = require("../../middlewares/requestTiming");
const { getRuntimeStatus } = require("../../utils/runtimeInfo");

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  }),
);
app.use(express.json());
app.use(requestId);
app.use(requestTiming);

app.get("/", (req, res) => {
  res.send("Data Service rodando");
});

app.get("/status", (req, res) => {
  res.json(getRuntimeStatus("data", __dirname));
});

app.use("/agencias", agenciaRoutes);
app.use("/users", userRoutes);
app.use("/periodos", periodoRoutes);
app.use("/produtos", produtoRoutes);
app.use("/import", importRoutes);

module.exports = app;
