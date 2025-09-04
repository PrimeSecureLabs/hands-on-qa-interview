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

## Bug #2: Configuração SSL Para Ambiente de Desenvolvimento

**Severidade**: Alta
**Categoria**: Funcional
**Status**: Aberto

### Descrição

O Sequelize está configurado para usar SSL na conexão com PostgreSQL, mas o servidor de desenvolvimento local não suporta SSL. Isso causa falha na conexão com o banco de dados em ambiente de desenvolvimento.

### Localização

- **Arquivo**: `src/config/database.ts`
- **Função/Linha**: Linhas 24-32

### Passos para Reproduzir

1. pnpm run dev
2. [Passo 2]
3. [Passo 3]

### Resultado Esperado

Conexão bem-sucedida com o banco PostgreSQL local em ambiente de desenvolvimento.

### Resultado Atual

Failed to connect to the database: ConnectionError [SequelizeConnectionError]: The server does not support SSL connections

### Impacto

Impossibilita a execução da aplicação em ambiente de desenvolvimento.

### Correção Sugerida

```typescript
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
```

---

## Bug #3: Configuração de CORS permissiva

**Severidade**: Alta
**Categoria**: Segurança
**Status**: Aberto

### Descrição

A configuração de CORS permite origem `'*'` (qualquer domínio) enquanto também permite credenciais (`credentials: true`), o que é uma configuração insegura e contraditória. Isso expõe a API a ataques CSRF e vazamento de dados.

### Localização

- **Arquivo**: `src/server.ts`
- **Função/Linha**: Linhas 65-70

### Passos para Reproduzir

1. Iniciar servidor: pnpm run dev
2. Em outro terminal: curl -H "Origin: http://site-qualquer.com" http://localhost:3000/health -I

### Resultado Esperado

O servidor deveria rejeitar requisições de origens não autorizadas ou não permitir credenciais quando a origem é '*'.

Por exemplo:

HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Content-Security-Policy: default-src 'none'
X-Content-Type-Options: nosniff
Content-Type: text/html; charset=utf-8
Content-Length: 1498
Date: Thu, 04 Sep 2025 19:34:00 GMT
Connection: keep-alive
Keep-Alive: timeout=5

### Resultado Atual

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 174
ETag: W/"ae-o1fYq/wK0L55tgttCEFNFhn5NA0"
Date: Thu, 04 Sep 2025 19:16:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

### Impacto

Essa configuração errada deixa a aplicação vulnerável, permitindo que sites maliciosos se passem por usuários legítimos e realizem ações sem autorização. Dados pessoais e senhas podem ser roubados e enviados para hackers, colocando em risco a privacidade de todos os usuários. Além disso, essa falha pode fazer com que a empresa tenha problemas com leis de proteção de dados, resultando em multas graves e perda de confiança dos clientes.

### Correção Sugerida

No .env:
ALLOWED_ORIGINS=http://localhost:3000,http://dominioconfiavel.com

No server.ts:
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origem (mobile apps, curl, postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'A política de CORS deste site não permite acesso a partir da origem especificada.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
```

---

## Bug #4: Vulnerabilidade de SQL Injection no Endpoint de Usuário

**Severidade**: Alta
**Categoria**: Segurança
**Status**: Aberto

### Descrição

O endpoint getUserById utiliza concatenação direta do parâmetro userId na query SQL, permitindo ataques de SQL Injection através do ID do usuário na URL.

### Localização

- **Arquivo**: `src/controllers/userController.ts`
- **Função/Linha**: getUserById (linhas 492-493)

### Passos para Reproduzir

1. Executar migrações para criar usuários de teste: pnpm run migrate
2. Logar com usuário autorizado e obter token JWT válido
3. Fazer requisição GET para: http://localhost:3000/users/1 UNION SELECT * FROM passwords incluindo o token no header Authorization

### Resultado Esperado

O parâmetro userId deveria ser sanitizado e usado como parâmetro preparado (parameterized query) para prevenir SQL Injection.

### Resultado Atual

Comandos SQL arbitrários são executados no banco de dados através do parâmetro ID.

### Impacto

- Comprometimento completo do banco de dados
- Vazamento de todos os dados sensíveis (usuários, senhas, informações pessoais)
- Possibilidade de exclusão de tabelas inteiras
- Execução de comandos arbitrários no banco

### Correção Sugerida

```typescript
  const query = `SELECT * FROM users WHERE id = :userId`;
  const results = await sequelize.query(query, { 
    type: QueryTypes.SELECT,
    replacements: { userId }
  });
```

---

## Bug #5: [TÍTULO DO BUG]

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
