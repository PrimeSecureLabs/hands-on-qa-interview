'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = await bcrypt.hash('Senha123!', 10);
    await queryInterface.bulkInsert('users', [
      {
        name: 'Usuário Teste 1',
        email: 'teste1@email.com',
        password: passwordHash,
        document: '12345678901',
        phone: '11999999999',
        localization: 'SP',
        enterprise: 'Empresa 1',
        company_position: 'Dev',
        website: 'https://empresa1.com',
        birthday: '1990-01-01',
        bio: 'Bio do usuário 1',
        level: 1,
        points: 0,
        created_at: new Date()
      },
      {
        name: 'Usuário Teste 2',
        email: 'teste2@email.com',
        password: passwordHash,
        document: '98765432100',
        phone: '11888888888',
        localization: 'RJ',
        enterprise: 'Empresa 2',
        company_position: 'QA',
        website: 'https://empresa2.com',
        birthday: '1992-02-02',
        bio: 'Bio do usuário 2',
        level: 1,
        points: 0,
        created_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: ['teste1@email.com', 'teste2@email.com']
    }, {});
  }
};
