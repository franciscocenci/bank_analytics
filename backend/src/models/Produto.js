const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Produto = sequelize.define(
    "Produto",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      mensuracao: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "volume",
        validate: {
          isIn: [["volume", "quantidade"]],
        },
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "produtos",
      timestamps: true,
    },
  );

  return Produto;
};
