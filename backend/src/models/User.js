const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    perfil: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "usuario", // admin | gerente | usuario
    },
  },
  {
    tableName: "users",
    timestamps: true,
  },
);

module.exports = User;
