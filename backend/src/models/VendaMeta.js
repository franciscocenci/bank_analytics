const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VendaMeta extends Model {}

  VendaMeta.init(
    {
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      produtoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      agenciaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "AgenciaId",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "UserId",
      },
      valorMeta: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      valorRealizado: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "VendaMeta",
      tableName: "VendaMeta",
      indexes: [
        {
          unique: true,
          fields: ["data", "produtoId", { name: "AgenciaId" }],
        },
      ],
    },
  );

  // Model associations.
  VendaMeta.associate = (models) => {
    VendaMeta.belongsTo(models.Agencia, {
      foreignKey: "agenciaId",
      as: "agencia",
    });
    VendaMeta.belongsTo(models.User, { foreignKey: "userId" });
  };

  return VendaMeta;
};
