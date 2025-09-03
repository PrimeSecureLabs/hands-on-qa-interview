# Desafio de QA - Central Service

Bem-vindo ao desafio de QA para a posição de **QA Pleno**! Este repositório contém um serviço central para gerenciamento de usuários, clientes e equipes com integração Stripe.

## Objetivo do Desafio

Sua missão é **identificar e corrigir problemas de qualidade** neste projeto, bem como **implementar melhorias** na cobertura de testes e processos de QA.

## O que Esperamos de Você

### 1. **Análise de Qualidade** (30 min)

- [ ] Analise o código e identifique possíveis bugs
- [ ] Verifique a estrutura do projeto e padrões de código
- [ ] Identifique problemas de segurança
- [ ] Avalie a configuração de CI/CD

### 2. **Testes Automatizados** (45 min)

- [ ] Execute os testes existentes e analise a cobertura
- [ ] Crie testes unitários para funções críticas
- [ ] Implemente testes de integração para APIs
- [ ] Adicione testes de validação de dados

### 3. **Melhorias de Processo** (30 min)

- [ ] Proponha melhorias no pipeline de testes
- [ ] Sugira estratégias de teste para o projeto
- [ ] Documente problemas encontrados

## Possíveis Áreas de Melhoria

Analise cuidadosamente as seguintes áreas que podem ter oportunidades de melhoria.

### Categorias para Investigação:

- **Segurança**: Práticas de autenticação e autorização
- **Performance**: Otimização de consultas e configurações
- **Validação**: Verificação de entrada de dados
- **Testes**: Cobertura e qualidade dos testes
- **Configuração**: Setup de ambiente e deploy
- **Documentação**: APIs e processos documentados

## Como Começar

### 1. Configuração do Ambiente

```bash
# Clone e acesse o diretório
cd teste-pratico

# Instale dependências
pnpm install

# Configure ambiente (crie seu .env baseado no .env.example)
cp .env.example .env

# Suba o banco com Docker
docker-compose up -d postgres

# Execute migrações
pnpm run migrate
pnpm run seed
```

### 2. Execute os Testes Existentes

```bash
# Testes básicos
pnpm test

# Com cobertura
pnpm run test:coverage

# Modo watch para desenvolvimento
pnpm run test:watch
```

### 3. Inicie o Servidor

```bash
# Desenvolvimento
pnpm run dev

# Produção
pnpm run build
pnpm start
```

## Endpoints para Testar

### Usuários

- `POST /api/users/register` - Registrar usuário
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Perfil (autenticado)
- `PUT /api/users/profile` - Atualizar perfil

### Clientes

- `POST /api/customers/register` - Registrar cliente
- `GET /api/customers/profile` - Perfil do cliente
- `POST /api/customers/rewards/claim` - Resgatar recompensa

### Equipes

- `POST /api/teams` - Criar equipe
- `POST /api/teams/:id/invite` - Convidar membro
- `GET /api/teams/:id/members` - Listar membros

## Entregáveis

### 1. Relatório de Bugs (BUGS.md)

```markdown
# Bugs Encontrados

## Bug #1: [Título do Bug]

- **Severidade**: Alta/Média/Baixa
- **Descrição**: [Descrição detalhada]
- **Passos para reproduzir**: [Passos]
- **Resultado esperado**: [O que deveria acontecer]
- **Resultado atual**: [O que está acontecendo]
- **Correção sugerida**: [Como corrigir]
```

### 2. Testes Implementados

- Adicione seus testes na pasta `src/__tests__/`
- Use a convenção: `[funcionalidade].test.ts`
- Inclua testes para casos de sucesso e falha

### 3. Plano de Testes (TEST_PLAN.md)

- Estratégia de testes para o projeto
- Tipos de teste recomendados
- Ferramentas sugeridas
- Processo de QA proposto

## Dicas de Investigação

### Áreas Críticas para Analisar:

1. **Autenticação/Autorização** - Middleware de auth
2. **Validação de Dados** - Controllers e modelos
3. **Segurança** - Headers, CORS, input sanitization
4. **Database** - Queries, migrations, seeds
5. **APIs** - Response handling, error management
6. **Configuração** - Docker, environment variables

### Ferramentas Úteis:

```bash
# Análise de dependências vulneráveis
npm audit

# Lint (quando configurado)
pnpm lint

# Verificar tipos TypeScript
pnpm run build
```

## Critérios de Avaliação

### Excelente (90-100%)

- Encontrou 7+ bugs críticos
- Implementou testes abrangentes
- Propôs melhorias de arquitetura
- Documentação clara e detalhada

### Bom (70-89%)

- Encontrou 5-6 bugs importantes
- Criou testes básicos funcionais
- Identificou melhorias de processo
- Documentação adequada

### Satisfatório (50-69%)

- Encontrou 3-4 bugs básicos
- Implementou alguns testes
- Relatório básico de problemas

## Tempo Sugerido: 90-120 minutos

## Próximos Passos

Após completar o desafio:

1. Commit suas alterações em uma branch
2. Crie um PR com suas melhorias
3. Prepare-se para discutir suas descobertas

---

**Boa sorte!**

> Lembre-se: O objetivo não é encontrar todos os problemas, mas demonstrar sua abordagem de QA e capacidade de análise.
