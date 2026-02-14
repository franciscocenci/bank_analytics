"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Users");

    if (!table.aprovado) {
      await queryInterface.addColumn("Users", "aprovado", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }

    if (!table.resetSenhaTokenHash) {
      await queryInterface.addColumn("Users", "resetSenhaTokenHash", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.resetSenhaTokenExpiraEm) {
      await queryInterface.addColumn("Users", "resetSenhaTokenExpiraEm", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("Users");

    if (table.resetSenhaTokenExpiraEm) {
      await queryInterface.removeColumn("Users", "resetSenhaTokenExpiraEm");
    }

    if (table.resetSenhaTokenHash) {
      await queryInterface.removeColumn("Users", "resetSenhaTokenHash");
    }

    if (table.aprovado) {
      await queryInterface.removeColumn("Users", "aprovado");
    }
  },
};
