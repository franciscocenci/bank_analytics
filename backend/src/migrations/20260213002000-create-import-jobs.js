"use strict";

async function tableExists(queryInterface, tableName) {
  const tables = await queryInterface.showAllTables();
  const names = tables.map((t) => (typeof t === "string" ? t : t.tableName));
  return names
    .map((name) => name.toLowerCase())
    .includes(tableName.toLowerCase());
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await tableExists(queryInterface, "ImportJobs"))) {
      await queryInterface.createTable("ImportJobs", {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        percentual: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        processadas: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        total: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        message: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        error: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        relatorio: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: {
            inseridos: 0,
            atualizados: 0,
            criadas: 0,
            ignorados: 0,
            erros: [],
          },
        },
        UserId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "Users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });
    }
  },

  async down(queryInterface) {
    if (await tableExists(queryInterface, "ImportJobs")) {
      await queryInterface.dropTable("ImportJobs");
    }
  },
};
