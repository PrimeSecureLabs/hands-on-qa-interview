# Relatório de Bugs Encontrados

> **Instruções**: Complete este relatório com os bugs que você encontrar durante sua análise.

## Resumo Executivo

- **Total de bugs encontrados**: 1
- **Severidade alta**: 1
- **Severidade média**: [NÚMERO]
- **Severidade baixa**: [NÚMERO]

---

## Bug #1: Ordem Incorreta de Inicialização de Models no Server

**Severidade**: Alta
**Categoria**: Funcional
**Status**: Aberto

### Descrição

A ordem de inicialização dos models do Sequelize está incorreta. Os models estão sendo inicializados dentro do bloco .then() após a conexão com o banco, mas o sequelize.sync() é chamado imediatamente depois, potencialmente antes de todos os models estarem completamente registrados no Sequelize.

### Localização

- **Arquivo**: `src/server.ts`
- **Função/Linha**: Linhas 95-108 (bloco sequelize.authenticate())

### Passos para Reproduzir

1. pnpm install
2. docker-compose up -d db
3. pnpm run migrate

### Resultado Esperado

Todos os models devem ser inicializados e sincronizados corretamente com o banco de dados, com todas as tabelas criadas na ordem apropriada e relacionamentos estabelecidos.

### Resultado Atual

Migrate falha com o erro "ERROR: No description found for "customers" table. Check the table name and schema; remember, they _are_ case sensitive."

### Impacto

Impede a configuração inicial da aplicação

### Correção Sugerida

```typescript
// Inicializar todos os models ANTES de qualquer operação com o banco
initUserSession(sequelize);
initRole(sequelize);
initUserRole(sequelize);
initTeam(sequelize);
initTeamMember(sequelize);
initMember(sequelize);
initTeamInvitation(sequelize);
initUserAuthentication(sequelize);

// DEPOIS fazer authenticate e sync
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected');
    return sequelize.sync(); 
  })
```

### Screenshots/Logs

[Se aplicável]

---

## Bug #2: [TÍTULO DO BUG]

**Severidade**: [Alta/Média/Baixa]
**Categoria**: [Segurança/Performance/Funcional/UX]
**Status**: Aberto

### Descrição

[Descreva o bug detalhadamente]

### Localização

- **Arquivo**: `src/caminho/arquivo.ts`
- **Função/Linha**: [Se aplicável]

### Passos para Reproduzir

1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

### Resultado Esperado

[O que deveria acontecer]

### Resultado Atual

[O que está acontecendo]

### Impacto

[Como isso afeta o usuário/sistema]

### Correção Sugerida

```typescript
// Código sugerido para correção
```

---

## Melhorias Gerais Sugeridas

### Segurança

- [ ] [Melhoria 1]
- [ ] [Melhoria 2]

### Performance

- [ ] [Melhoria 1]
- [ ] [Melhoria 2]

### Testes

- [ ] [Melhoria 1]
- [ ] [Melhoria 2]

### Documentação

- [ ] [Melhoria 1]
- [ ] [Melhoria 2]

---

## Próximos Passos Recomendados

1. **Prioridade Alta**: [Ações imediatas]
2. **Prioridade Média**: [Ações de médio prazo]
3. **Prioridade Baixa**: [Melhorias futuras]

---

**Data do Relatório**: [DATA]
**Responsável pela Análise**: [SEU NOME]
