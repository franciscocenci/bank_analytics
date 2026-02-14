const bcrypt = require("bcrypt");
const { sequelize, User } = require("../models");
require("dotenv").config();

const requiredEnv = [
  "INITIAL_ADMIN_NAME",
  "INITIAL_ADMIN_EMAIL",
  "INITIAL_ADMIN_PASSWORD",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(
    `Variáveis obrigatórias ausentes para seed do admin: ${missingEnv.join(", ")}.`,
  );
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === "production";
const allowSeed = process.env.ALLOW_ADMIN_SEED === "true";

if (isProduction && !allowSeed) {
  console.error(
    "Seed do admin bloqueado em produção. Defina ALLOW_ADMIN_SEED=true para executar.",
  );
  process.exit(1);
}

async function seedAdmin() {
  const adminExists = await User.findOne({ where: { perfil: "admin" } });

  if (adminExists) {
    console.log("Administrador já existe no banco de dados.");
    return;
  }

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
}

(async () => {
  try {
    await sequelize.authenticate();
    await seedAdmin();
    await sequelize.close();
  } catch (err) {
    console.error("Erro ao executar seed do admin:", err);
    process.exit(1);
  }
})();
