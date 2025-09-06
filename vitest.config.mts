import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis do .env.test
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup/vitest.setup.ts'], // Corrigido o caminho
    pool: 'forks',
    testTimeout: 10000, // 10 segundos para testes de integração
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '*.config.*',
        'src/migrations/',
        'src/seeders/'
      ]
    }
  },
});