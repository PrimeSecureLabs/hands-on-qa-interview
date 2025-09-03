import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    env: {
      NODE_ENV: 'test',
      STRIPE_SECRET_KEY: 'sk_test_fake_key_for_testing_only',
      STRIPE_WEBHOOK_SECRET: 'whsec_fake_webhook_secret_for_testing_only',
      PORT: '3001',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'test_db',
      DB_USER: 'test_user',
      DB_PASSWORD: 'test_password',
      SECRET_KEY: 'test_secret_key_for_testing_only',
      PAYMENT_GATEWAY_URL: 'http://localhost:3005',
    },
    pool: 'forks',
  },
});
