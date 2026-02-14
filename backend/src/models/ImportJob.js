const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ImportJob extends Model {}

  ImportJob.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      percentual: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      processadas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      error: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      relatorio: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          inseridos: 0,
          atualizados: 0,
          criadas: 0,
          ignorados: 0,
          erros: [],
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "UserId",
      },
    },
    {
      sequelize,
      modelName: "ImportJob",
      tableName: "ImportJobs",
      timestamps: true,
    },
  );

  ImportJob.associate = (models) => {
    ImportJob.belongsTo(models.User, { foreignKey: "userId", as: "usuario" });
  };

  return ImportJob;
};
