const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const importRoutes = require("./routes/import.routes");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const agenciaRoutes = require("./routes/agencia.routes");
const userRoutes = require("./routes/user.routes");
const periodoRoutes = require("./routes/periodo.routes");
const produtoRoutes = require("./routes/produto.routes");
const requestId = require("./middlewares/requestId");
const requestTiming = require("./middlewares/requestTiming");
const { getRuntimeStatus } = require("./utils/runtimeInfo");

require("dotenv").config();

const requiredEnv = [
  "DB_NAME",
  "DB_USER",
  "DB_PASS",
  "DB_HOST",
  "DB_PORT",
  "JWT_SECRET",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(
    `Variáveis obrigatórias ausentes: ${missingEnv.join(", ")}. Verifique o .env.`,
  );
  process.exit(1);
}

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

// Health check endpoint.
app.get("/", (req, res) => {
  res.send("API Bank Analytics rodando");
});

app.get("/status", (req, res) => {
  res.json(getRuntimeStatus("monolith", __dirname));
});

// API routes.
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/import", importRoutes);
app.use("/agencias", agenciaRoutes);
app.use("/users", userRoutes);
app.use("/periodos", periodoRoutes);
app.use("/produtos", produtoRoutes);

// Server startup sequence.
(async () => {
  try {
    // Connect to the database.
    await sequelize.authenticate();
    console.log("Conectado ao PostgreSQL");

    // Start the HTTP server.
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erro ao iniciar servidor:", err);
  }
})();
