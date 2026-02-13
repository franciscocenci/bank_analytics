const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { sequelize, User } = require("./models");
const importRoutes = require("./routes/import.routes");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const agenciaRoutes = require("./routes/agencia.routes");
const userRoutes = require("./routes/user.routes");
const periodoRoutes = require("./routes/periodo.routes");
const produtoRoutes = require("./routes/produto.routes");

require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// Health check endpoint.
app.get("/", (req, res) => {
  res.send("API Bank Analytics rodando");
});

// API routes.
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/import", importRoutes);
app.use("/agencias", agenciaRoutes);
app.use("/users", userRoutes);
app.use("/periodos", periodoRoutes);
app.use("/produtos", produtoRoutes);

// Seed initial admin user if missing.
async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ where: { perfil: "admin" } });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(
        process.env.INITIAL_ADMIN_PASSWORD,
        10,
      );

      await User.create({
        nome: process.env.INITIAL_ADMIN_NAME,
        email: process.env.INITIAL_ADMIN_EMAIL,
        senha: hashedPassword,
        perfil: "admin",
        aprovado: true,
        trocaSenha: false,
      });

      console.log("Primeiro administrador criado usando dados do .env.");
    } else {
      console.log("Administrador já existe no banco de dados.");
    }
  } catch (error) {
    console.error("Erro ao criar admin inicial:", error);
  }
}

// Server startup sequence.
(async () => {
  try {
    // Connect to the database.
    await sequelize.authenticate();
    console.log("Conectado ao PostgreSQL");

    // Sync tables (create if missing).
    await sequelize.sync({ alter: true });
    console.log("Tabelas sincronizadas");

    // Seed admin after tables exist.
    await seedAdmin();

    // Start the HTTP server.
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error("Erro ao iniciar servidor:", err);
  }
})();
