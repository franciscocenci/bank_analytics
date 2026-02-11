const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Periodo extends Model {}

  Periodo.init(
    {
      dataInicio: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      dataFim: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Periodo",
      tableName: "Periodos",
      timestamps: true,
    },
  );

  // Model associations.
  Periodo.associate = (models) => {
    // Example association if Periodo needs to relate to other models.
    // Periodo.hasMany(models.VendaMeta, { foreignKey: "PeriodoId" });
  };

  return Periodo;
};
