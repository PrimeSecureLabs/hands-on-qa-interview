# Desafio de QA - **Documente seus achados** usando os templates- Headers de seguran- Dependências (`package.json`)

## Tecnologias

### Banco de Dadosrnecidos

### Setup Rápido Service

**Bem-vindo ao teste prático para QA Pleno!**

Este repositório contém um serviço central com problemas intencionais que você deve encontrar e corrigir. Sua missão é identificar problemas de qualidade, implementar testes e propor melhorias.

## Instruções do Desafio

### Como Começarfio de QA - Central Service

**Bem-vindo ao teste prático para QA Pleno!**

Este repositório contém um serviço central com **bugs intencionais** que você deve encontrar e corrigir. Sua missão é identificar problemas de qualidade, implementar testes e propor melhorias.

## � Instruções do Desafio

### 🚀 Como Começar

1. **Leia o desafio completo**: [`QA_CHALLENGE.md`](./QA_CHALLENGE.md)
2. **Configure o ambiente** seguindo as instruções abaixo
3. **Analise o código** e identifique problemas
4. **Implemente testes** e correções
5. **Documente seus achados** usando os templates fornecidos

### ⚡ Setup Rápido

```bash
# Instalar dependências
pnpm install

# Configurar ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Subir banco de dados
docker-compose up -d postgres

# Executar migrações
pnpm run migrate
pnpm run seed

# Executar testes
pnpm test

# Iniciar servidor
pnpm run dev
```

## Seu Objetivo

### Encontre e corrija os problemas (há pelo menos 8 problemas intencionais!)

- **Bugs de Segurança** - Vulnerabilidades críticas
- **Bugs de Validação** - Dados não validados adequadamente
- **Bugs de Performance** - Configurações inadequadas
- **Bugs de Configuração** - Problemas de ambiente e deploy

## Arquivos Importantes- **[`QA_CHALLENGE.md`](./QA_CHALLENGE.md)** - Instruções detalhadas do desafio

- **[`BUGS_TEMPLATE.md`](./BUGS_TEMPLATE.md)** - Template para reportar bugs
- **[`TEST_PLAN_TEMPLATE.md`](./TEST_PLAN_TEMPLATE.md)** - Template para plano de testes
- **`src/__tests__/`** - Testes existentes (muito básicos!)

## Áreas para Investigar

### Segurança

- Middleware de autenticação (`src/middlewares/`)
- Validação de dados (`src/controllers/`)
- Configuração CORS (`src/server.ts`)
- Headers de segurança

### Banco de Dados

- Queries SQL (`src/controllers/`)
- Validação de entrada
- Sanitização de dados

### APIs

- Endpoints de usuário (`/api/users/*`)
- Endpoints de cliente (`/api/customers/*`)
- Tratamento de erros

### Configuração

- Docker (`Dockerfile`, `docker-compose.yml`)
- Variáveis de ambiente (`.env.example`)
- Dependências (`package.json`)

## � Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **Vitest** - Framework de testes
- **JWT** - Autenticação
- **Stripe** - Pagamentos (mock)

## Dicas Importantes

1. **Execute os testes primeiro** - Veja o que já funciona
2. **Teste todas as APIs** - Use Postman/Insomnia ou curl
3. **Verifique logs** - Erros podem revelar problemas
4. **Analise headers HTTP** - Problemas de segurança
5. **Teste casos extremos** - Inputs maliciosos, dados inválidos

## Tempo Sugerido: 90-120 minutos

## Entregáveis

1. **Relatório de Bugs** - Use o template `BUGS_TEMPLATE.md`
2. **Testes Implementados** - Adicione em `src/__tests__/`
3. **Correções de Código** - Commits bem documentados
4. **Plano de Testes** - Use o template `TEST_PLAN_TEMPLATE.md`

---

## Para Começar Agora

```bash
# 1. Configure o ambiente
pnpm install && cp .env.example .env

# 2. Execute os testes existentes
pnpm test

# 3. Inicie o servidor e teste as APIs
pnpm run dev

# 4. Abra o QA_CHALLENGE.md e comece sua análise!
```

**Boa sorte!**

> Lembre-se: o objetivo não é encontrar TODOS os problemas, mas demonstrar sua metodologia de QA e capacidade de análise.

## Executando

### Desenvolvimento

```bash
pnpm run dev
```

### Produção

```bash
pnpm run build
pnpm start
```

### Com Docker

```bash
# Build e execução
pnpm run docker:compose:up

# Parar os serviços
pnpm run docker:compose:down
```

## Testes

```bash
# Executar testes
pnpm test

# Testes em modo watch
pnpm run test:watch

# Testes com coverage
pnpm run test:coverage
```

## 📦 Scripts Disponíveis

| Script                  | Descrição                       |
| ----------------------- | ------------------------------- |
| `pnpm run dev`          | Executa em modo desenvolvimento |
| `pnpm run build`        | Compila o TypeScript            |
| `pnpm start`            | Executa a versão compilada      |
| `pnpm test`             | Executa os testes               |
| `pnpm run migrate`      | Executa as migrations           |
| `pnpm run seed`         | Executa os seeders              |
| `pnpm run release`      | Cria uma nova release           |
| `pnpm run docker:build` | Build da imagem Docker          |

## 🐳 Docker

### Build da imagem

```bash
docker build -t svc-central .
```

### Executar com Docker Compose

```bash
docker-compose up --build
```

### Variáveis de Ambiente Seguras

Para produção, use Docker Secrets:

```bash
# Criar secrets
echo "your_db_password" | docker secret create db_password -
echo "your_jwt_secret" | docker secret create jwt_secret -
echo "your_stripe_key" | docker secret create stripe_secret -
```

Veja `docker-secrets.md` para mais detalhes.

## 🔒 Segurança

- ✅ Variáveis sensíveis via Docker Secrets
- ✅ Usuário não-root no container
- ✅ Health checks configurados
- ✅ Validação de commits com Commitlint
- ✅ Testes obrigatórios antes de push

## 📝 Contribuindo

### Padrão de Commits

Este projeto usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração sem mudança de funcionalidade
test: adiciona ou atualiza testes
chore: tarefas de build, configurações, etc
```

### Workflow

1. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
2. Faça commits seguindo o padrão
3. Push da branch: `git push origin feature/nova-funcionalidade`
4. Abra um Pull Request

## 🚢 Releases

Releases são criadas automaticamente via GitHub Actions quando commits são merged na branch `main`:

- **patch**: `fix:` commits
- **minor**: `feat:` commits
- **major**: commits com `BREAKING CHANGE:`

Para criar uma release manual:

```bash
pnpm run release
```

## 🔗 Endpoints

### Health Check

```
GET /health
```

### Usuários

```
POST /users/register
POST /users/login
GET /users/profile
PUT /users/profile
DELETE /users/profile
```

### Clientes

```
POST /customers/register
POST /customers/login
GET /customers/profile
PUT /customers/profile
DELETE /customers/profile
```

### Equipes

```
POST /teams
GET /teams/:id
PUT /teams/:id
DELETE /teams/:id
POST /teams/:id/members
DELETE /teams/:id/members/:memberId
```

## 📊 Monitoramento

- Health check: `http://localhost:3000/health`
- Logs estruturados com níveis configuráveis
- Métricas de performance (planejado)

## 🤝 Suporte

Para dúvidas ou problemas:

1. Verifique as [Issues](https://github.com/PrimeSecureLabs/svc-central/issues)
2. Crie uma nova issue com detalhes
3. Entre em contato com a equipe

## 📄 Licença

ISC - Veja [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido por:** Thezehel & Khai Dreams
**Organização:** PrimeSecureLabs
