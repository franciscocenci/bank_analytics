const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class User extends Model {}

  User.init(
    {
      nome: DataTypes.STRING,

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      senha: DataTypes.STRING,

      perfil: DataTypes.STRING,

      agenciaId: {
        type: DataTypes.INTEGER,
        field: "AgenciaId",
      },

      trocaSenha: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      aprovado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      resetSenhaTokenHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      resetSenhaTokenExpiraEm: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
    },
  );

  // Model associations.
  User.associate = (models) => {
    User.belongsTo(models.Agencia, { foreignKey: "agenciaId", as: "agencia" });
    User.hasMany(models.VendaMeta, { foreignKey: "userId", as: "vendas" });
  };

  return User;
};
