'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verifica se a coluna birthday já existe
    const tableInfo = await queryInterface.describeTable('customers');
    
    if (tableInfo.birthday) {
      // Se existe como STRING, remove e adiciona como DATE
      await queryInterface.removeColumn('customers', 'birthday');
    }
    
    // Adiciona a coluna birthday como DATE
    await queryInterface.addColumn('customers', 'birthday', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove a coluna birthday
    await queryInterface.removeColumn('customers', 'birthday');
  }
};
