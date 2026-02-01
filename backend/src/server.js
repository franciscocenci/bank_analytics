const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { sequelize, User } = require("./models"); // Importamos o User aqui em cima
const importRoutes = require("./routes/import.routes");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const agenciaRoutes = require("./routes/agencia.routes");
const userRoutes = require("./routes/user.routes");

require("dotenv").config(); // Garante que as variáveis do .env sejam lidas

const app = express();

app.use(
  cors({
    origin: true, // Permite qualquer origem que venha do navegador
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.send("API Bank Analytics rodando 🚀");
});

// Rotas do sistema
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/import", importRoutes);
app.use("/agencias", agenciaRoutes);
app.use("/users", userRoutes);

// Função para criar o Administrador Inicial
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
      });

      console.log(
        "🚀 Primeiro Administrador criado com sucesso usando dados do .env!",
      );
    } else {
      console.log("ℹ️ Administrador já existe no banco de dados.");
    }
  } catch (error) {
    console.error("❌ Erro ao criar admin inicial:", error);
  }
}

// Inicialização do Servidor (Ordem cronológica correta)
(async () => {
  try {
    // 1. Conecta ao Banco
    await sequelize.authenticate();
    console.log("✅ Conectado ao PostgreSQL");

    // 2. Sincroniza as Tabelas (Cria elas se não existirem)
    await sequelize.sync({ alter: true });
    console.log("📦 Tabelas sincronizadas");

    // 3. AGORA SIM: Cria o Admin (Depois que a tabela já existe)
    await seedAdmin();

    // 4. Liga o servidor
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erro ao iniciar servidor:", err);
  }
})();
