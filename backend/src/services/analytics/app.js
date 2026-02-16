const express = require("express");
const cors = require("cors");

const dashboardRoutes = require("../../routes/dashboard.routes");
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
  res.send("Analytics Service rodando");
});

app.get("/status", (req, res) => {
  res.json(getRuntimeStatus("analytics", __dirname));
});

app.use("/dashboard", dashboardRoutes);

module.exports = app;
