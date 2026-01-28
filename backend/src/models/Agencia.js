const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Agencia = sequelize.define(
  "Agencia",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "agencias",
    timestamps: true,
  },
);

module.exports = Agencia;
