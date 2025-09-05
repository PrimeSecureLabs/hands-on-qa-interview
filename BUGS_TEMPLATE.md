# Relatório de Bugs Encontrados

> **Instruções**: Complete este relatório com os bugs que você encontrar durante sua análise.

## Resumo Executivo

- **Total de bugs encontrados**: 6
- **Severidade alta**: 6
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

## Bug #5: Validação de Dados de Cliente Desativada

**Severidade**: Alta
**Categoria**: Validação
**Status**: Aberto

### Descrição

No controller de clientes (src/controllers/customerController.ts), a função createCustomer deveria chamar validateCustomerData para verificar CPF, telefone, e‑mail e força da senha antes de criar o cliente. Entretanto, essa chamada está comentada.

### Localização

- **Arquivo**: `src/controllers/customerController.ts`
- **Função/Linha**: Linhas 146-150

### Passos para Reproduzir

1. pnpm run dev
2. Enviar uma requisição POST /customers com dados inválidos via cURL ou Postman

### Resultado Esperado

O endpoint /customers deveria validar cada campo e responder com 400 Bad Request, retornando uma lista de erros de validação (por exemplo, “CPF inválido”, “Telefone é obrigatório”, “Senha deve ter no mínimo 6 caracteres”) sem criar nenhum registro.

### Resultado Atual

Apesar dos dados inconsistentes, a API retorna 201 Created e persiste o cliente tanto na base local quanto no Stripe. O bloco de validação de dados está comentado no código, permitindo que o cadastro siga adiante sem qualquer verificação.

### Impacto

A ausência de validação compromete a qualidade dos dados e a segurança do sistema: clientes com CPF incorreto e senhas fracas são aceitos, prejudicando processos de cobrança e comunicações, e facilitando a criação de contas falsas. Isso gera retrabalho para corrigir dados, pode levar a falhas em integrações externas e abre brechas para uso indevido da plataforma.

### Correção Sugerida

```typescript
    // Validação comentada - permite criação sem validar dados
    const validationErrors = await validateCustomerData(customerData);
     if (validationErrors.length > 0) {
       return res.status(400).json({ errors: validationErrors });
     }
```

---

## Bug #6: Timeout Irrealista e Vazamento de Segredo no PaymentGatewayService

**Severidade**: Alta
**Categoria**: Segurança/Performance
**Status**: Aberto

### Descrição

O PaymentGatewayService utiliza um timeout irrealista de 100ms e expõe a SECRET_KEY da aplicação nos headers das requisições para o serviço externo de pagamento.

### Localização

- **Arquivo**: `src/services/paymentGatewayService.ts`
- **Função/Linha**: [Se aplicável]

### Passos para Reproduzir

1. pnpm run dev
2. Simular um atraso de rede no endpoint externo de pagamento
3. Chamar a funcionalidade de cadastro de cliente com afiliado
4. Observar falha por timeout e capturar os headers da requisição

### Resultado Esperado

- Timeout configurado de forma realista (5-30 segundos)
- Uso de chave API específica para o serviço de pagamento, não a SECRET_KEY da aplicação

### Resultado Atual

- Timeout de 100ms causa falhas constantes em chamadas externas
- SECRET_KEY é exposta no header X-Internal-Secret
- Requisições falham mesmo em condições normais de rede

### Impacto

- Falhas constantes no processo de registro de afiliados
- Vazamento de segredo crítico que compromete toda a segurança JWT da aplicação
- Experiência do usuário degradada devido a timeouts frequentes

### Correção Sugerida

```typescript
const DEFAULT_TIMEOUT = Number(process.env.PAYMENT_TIMEOUT_MS) || 10000;

const response = await axios.post(
  `${this.baseURL}/api/customers/register`,
  data,
  {
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.PAYMENT_GATEWAY_API_KEY,
    },
  }
);
```

---

## Bug #7: Falta de Validação de Entrada em Team Controller

**Severidade**: Alta
**Categoria**: Segurança
**Status**: Aberto

### Descrição

O controller de equipes não valida dados de entrada nos endpoints de criação de equipe e convite de membros, permitindo criação de equipes com dados inválidos ou maliciosos.

### Localização

- **Arquivo**: `src/controllers/teamController.ts`
- **Função/Linha**: createTeam e inviteMember

### Passos para Reproduzir

1. Fazer login com usuário admin
2. Enviar POST /teams com payload vazio ou com dados inválidos
3. Observar que a equipe é criada sem validação

### Resultado Esperado

Validação de campos obrigatórios e sanitização de dados de entrada.

### Resultado Atual

Equipes são criadas com dados inválidos, podendo causar problemas de integridade.

### Impacto

- Criação de registros inválidos no banco
- Possível exploração por dados maliciosos
- Inconsistência de dados

### Correção Sugerida

```typescript
// No início de createTeam
if (!req.body.name || req.body.name.trim().length < 3) {
  return res.status(400).json({ error: 'Nome da equipe é obrigatório (mín. 3 caracteres)' });
}

// Sanitização
const name = req.body.name.trim();
const description = req.body.description?.trim() || '';
```

---

## Bug #8: Ausência de Rate Limiting em Endpoints Críticos

**Severidade**: Média
**Categoria**: Segurança
**Status**: Aberto

### Descrição

Os endpoints de autenticação (login) não possuem rate limiting, permitindo ataques de força bruta contra contas de usuário.

### Localização

- **Arquivo**: `src/controllers/userController.ts` e `src/controllers/customerController.ts`
- **Função/Linha**: loginUser e loginCustomer

### Passos para Reproduzir

1. Utilize ferramentas como curl ou Postman
2. Execute múltiplas requisições POST consecutivas para /api/auth/login

### Resultado Esperado

Um sistema de rate limiting que proteja os endpoints de autenticação contra ataques de força bruta, limitando tentativas consecutivas de acesso e retornando respostas adequadas quando os limites forem excedidos.

### Resultado Atual

Tentativas ilimitadas de login permitidas, facilitando ataques de força bruta.

### Impacto

Vulnerabilidade a ataques de força bruta que podem comprometer contas de usuário.

### Correção Sugerida

Necessário instalar a denpedência `express-rate-limit`

```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});

// Aplicar nos endpoints de login
```

---

## Melhorias Gerais Sugeridas

### Segurança

- [ ] Implementar rate limiting em endpoints de autenticação
- [ ] Adicionar sanitização de dados em todos os inputs de usuário
- [ ] Implementar validação de schema para todas as entradas de API
- [ ] Utilizar variáveis de ambiente para todas as configurações sensíveis

### Performance

- [ ] Adicionar cache para consultas frequentes ao banco de dados
- [ ] Implementar paginação em endpoints que retornam listas grandes
- [ ] Otimizar queries SQL com índices apropriados
- [ ] Configurar timeout adequado para todas as chamadas externas

### Testes

- [ ] Criar testes unitários para todos os controllers e services
- [ ] Implementar testes de integração para fluxos críticos
- [ ] Adicionar testes de segurança (SQL Injection, XSS, etc.)
- [ ] Criar testes de carga para endpoints principaisCriar testes de carga para endpoints principais

### Documentação

- [ ] Documentar todos os endpoints da API com exemplos
- [ ] Criar guia de setup para novos desenvolvedores
- [ ] Documentar fluxos de negócio importantes
- [ ] Adicionar comentários no código

---

## Próximos Passos Recomendados

1. **Prioridade Alta**: Corrigir vulnerabilidades críticas de segurança (SQL Injection, vazamento de SECRET_KEY, CORS)
2. **Prioridade Média**: Implementar validações de dados e melhorar tratamento de erros
3. **Prioridade Baixa**: Otimizar performance e adicionar testes automatizados

---

**Data do Relatório**: 04/09/2025
**Responsável pela Análise**: Jônatas Alecrim
