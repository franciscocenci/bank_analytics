"use strict";

async function tableExists(queryInterface, tableName) {
  const tables = await queryInterface.showAllTables();
  const names = tables.map((t) => (typeof t === "string" ? t : t.tableName));
  return names.map((name) => name.toLowerCase()).includes(tableName.toLowerCase());
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await tableExists(queryInterface, "Agencia"))) {
      await queryInterface.createTable("Agencia", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        nome: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        codigo: {
          type: Sequelize.STRING(4),
          allowNull: false,
          unique: true,
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

    if (!(await tableExists(queryInterface, "Users"))) {
      await queryInterface.createTable("Users", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        nome: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        senha: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        perfil: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        AgenciaId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "Agencia",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        trocaSenha: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        aprovado: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        resetSenhaTokenHash: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        resetSenhaTokenExpiraEm: {
          type: Sequelize.DATE,
          allowNull: true,
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

    if (!(await tableExists(queryInterface, "produtos"))) {
      await queryInterface.createTable("produtos", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        nome: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        mensuracao: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "volume",
        },
        ativo: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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

    if (!(await tableExists(queryInterface, "Periodos"))) {
      await queryInterface.createTable("Periodos", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        dataInicio: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        dataFim: {
          type: Sequelize.DATEONLY,
          allowNull: false,
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

    if (!(await tableExists(queryInterface, "VendaMeta"))) {
      await queryInterface.createTable("VendaMeta", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        data: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        produtoId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "produtos",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        AgenciaId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Agencia",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
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
        valorMeta: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        valorRealizado: {
          type: Sequelize.FLOAT,
          allowNull: false,
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

      await queryInterface.addIndex("VendaMeta", ["data", "produtoId", "AgenciaId"], {
        unique: true,
        name: "vendameta_data_produto_agencia_unique",
      });
    }
  },

  async down(queryInterface) {
    if (await tableExists(queryInterface, "VendaMeta")) {
      await queryInterface.dropTable("VendaMeta");
    }

    if (await tableExists(queryInterface, "Periodos")) {
      await queryInterface.dropTable("Periodos");
    }

    if (await tableExists(queryInterface, "produtos")) {
      await queryInterface.dropTable("produtos");
    }

    if (await tableExists(queryInterface, "Users")) {
      await queryInterface.dropTable("Users");
    }

    if (await tableExists(queryInterface, "Agencia")) {
      await queryInterface.dropTable("Agencia");
    }
  },
};
