const User = require("./User");
const Agencia = require("./Agencia");
const VendaMeta = require("./VendaMeta");

// Relações
Agencia.hasMany(User);
User.belongsTo(Agencia);

User.hasMany(VendaMeta);
VendaMeta.belongsTo(User);

Agencia.hasMany(VendaMeta);
VendaMeta.belongsTo(Agencia);

module.exports = {
  User,
  Agencia,
  VendaMeta,
};
