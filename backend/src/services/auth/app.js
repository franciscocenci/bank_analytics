const express = require("express");
const cors = require("cors");

const authRoutes = require("../../routes/auth.routes");
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
  res.send("Auth Service rodando");
});

app.get("/status", (req, res) => {
  res.json(getRuntimeStatus("auth", __dirname));
});

app.use("/auth", authRoutes);

module.exports = app;
