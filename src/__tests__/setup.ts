import { beforeAll, afterAll } from 'vitest';

// Setup global para os testes
beforeAll(async () => {
  // Configurações que devem ser executadas antes de todos os testes
  console.log('Iniciando configuração dos testes...');
});

afterAll(async () => {
  // Limpeza após todos os testes
  console.log('Limpeza dos testes concluída');
});
