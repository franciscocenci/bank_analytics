const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
  },
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// MODELS (factory pattern)
db.Agencia = require("./Agencia")(sequelize);
db.User = require("./User")(sequelize);
db.VendaMeta = require("./VendaMeta")(sequelize);

// ASSOCIAÇÕES
db.Agencia.hasMany(db.User, { foreignKey: "AgenciaId" });
db.User.belongsTo(db.Agencia, { foreignKey: "AgenciaId" });

db.Agencia.hasMany(db.VendaMeta, { foreignKey: "AgenciaId" });
db.VendaMeta.belongsTo(db.Agencia, { foreignKey: "AgenciaId" });

db.User.hasMany(db.VendaMeta, { foreignKey: "UserId" });
db.VendaMeta.belongsTo(db.User, { foreignKey: "UserId" });

module.exports = db;
