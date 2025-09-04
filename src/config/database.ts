import { Sequelize } from 'sequelize';
import { initUser } from '../models/user/User';
import { initCustomer } from '../models/customer/Customer';
import { initCustomerLevel } from '../models/customer/CustomerLevels';

const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!, 10),
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  logging: false,
  // CORREÇÃO BUG 2: Adicionar configuração SSL para produção
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
});

initUser(sequelize);
initCustomer(sequelize);
initCustomerLevel(sequelize);

export default sequelize;
