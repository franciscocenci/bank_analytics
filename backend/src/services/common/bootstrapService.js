const { sequelize } = require("../../models");

const requiredEnv = [
  "DB_NAME",
  "DB_USER",
  "DB_PASS",
  "DB_HOST",
  "DB_PORT",
  "JWT_SECRET",
];

function validateRequiredEnv() {
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length > 0) {
    console.error(
      `Variáveis obrigatórias ausentes: ${missingEnv.join(", ")}. Verifique o .env.`,
    );
    process.exit(1);
  }
}

async function startService({ app, serviceName, portEnvVar, defaultPort }) {
  validateRequiredEnv();

  try {
    await sequelize.authenticate();
    console.log(`[${serviceName}] Conectado ao PostgreSQL`);

    const PORT = Number(process.env[portEnvVar]) || defaultPort;
    app.listen(PORT, () => {
      console.log(`[${serviceName}] ✅ Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error(`[${serviceName}] ❌ Erro ao iniciar servidor:`, err);
  }
}

module.exports = {
  startService,
};
