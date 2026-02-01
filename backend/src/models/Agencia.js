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
        type: DataTypes.STRING(4),
        allowNull: false,
        unique: true,
        validate: {
          isNumeric: true,
          len: [1, 4],
        },
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
      timestamps: true,
    },
  );

  return Agencia;
};
