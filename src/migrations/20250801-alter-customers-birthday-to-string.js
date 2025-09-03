'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('customers', 'birthday', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('customers', 'birthday', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }
};
