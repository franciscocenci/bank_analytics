const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Agencia extends Model {}

  Agencia.init(
    {
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      codigo: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Agencia",
      tableName: "Agencia",
      timestamps: true, // 👈 deixa explícito (boa prática)
    },
  );

  return Agencia;
};
