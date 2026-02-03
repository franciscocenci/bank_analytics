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

      trocaSenha: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
    },
  );

  return User;
};
