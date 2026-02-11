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

// Models.
db.Agencia = require("./Agencia")(sequelize);
db.User = require("./User")(sequelize);
db.VendaMeta = require("./VendaMeta")(sequelize);
db.Periodo = require("./Periodo")(sequelize);
db.Produto = require("./Produto")(sequelize);

// Associations.
// User <-> Agency.
db.Agencia.hasMany(db.User, { foreignKey: "agenciaId", as: "usuarios" });
db.User.belongsTo(db.Agencia, { foreignKey: "agenciaId", as: "agencia" });

// Agency <-> VendaMeta.
db.Agencia.hasMany(db.VendaMeta, { foreignKey: "agenciaId", as: "vendas" });
db.VendaMeta.belongsTo(db.Agencia, { foreignKey: "agenciaId", as: "agencia" });

// User <-> VendaMeta.
db.User.hasMany(db.VendaMeta, { foreignKey: "userId", as: "registros" });
db.VendaMeta.belongsTo(db.User, { foreignKey: "userId", as: "usuario" });

// Product <-> VendaMeta.
db.Produto.hasMany(db.VendaMeta, { foreignKey: "produtoId", as: "vendas" });
db.VendaMeta.belongsTo(db.Produto, { foreignKey: "produtoId", as: "produto" });

// Period <-> VendaMeta.
db.Periodo.hasMany(db.VendaMeta, { foreignKey: "periodoId", as: "vendas" });
db.VendaMeta.belongsTo(db.Periodo, { foreignKey: "periodoId", as: "periodo" });

module.exports = db;
