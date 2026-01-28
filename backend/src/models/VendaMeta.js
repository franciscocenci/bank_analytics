const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VendaMeta = sequelize.define(
  "VendaMeta",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    mes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    ano: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    produto: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    valorMeta: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    valorRealizado: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "vendas_metas",
    timestamps: true,
  },
);

module.exports = VendaMeta;
