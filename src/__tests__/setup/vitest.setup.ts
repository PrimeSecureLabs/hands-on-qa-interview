import { beforeAll, afterAll, beforeEach } from 'vitest';
import sequelize from '../../config/database';

// Setup executado antes de todos os testes
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log('Test database connected');
    await sequelize.sync({ force: true });
    console.log('Test database synced');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
});

// Limpa dados entre cada teste
beforeEach(async () => {
  const tables = Object.keys(sequelize.models);
  for (const table of tables) {
    await sequelize.models[table].destroy({ truncate: true, cascade: true });
  }
});

// Fecha conexão após todos os testes
afterAll(async () => {
  await sequelize.close();
});