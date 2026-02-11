const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VendaMeta extends Model {}

  indexes: ([
    {
      unique: true,
      fields: ["data", "produtoId", "AgenciaId"],
    },
  ],
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
      },
    ));

  // Model associations.
  VendaMeta.associate = (models) => {
    VendaMeta.belongsTo(models.Agencia, {
      foreignKey: "AgenciaId",
      as: "agencia",
    });
    VendaMeta.belongsTo(models.User, { foreignKey: "UserId" });
  };

  return VendaMeta;
};
