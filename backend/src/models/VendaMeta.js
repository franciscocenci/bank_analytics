const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VendaMeta extends Model {}

  VendaMeta.init(
    {
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      produto: {
        type: DataTypes.STRING,
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
  );

  return VendaMeta;
};
