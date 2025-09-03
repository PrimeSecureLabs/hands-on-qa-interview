# Configuração AWS OIDC - svc-central

## ✅ Configuração Universal Concluída

### Role AWS Universal
- **Nome**: `GitHubActionsUniversalRole`
- **ARN**: `arn:aws:iam::012419504148:role/GitHubActionsUniversalRole`
- **Escopo**: Todos os repositórios da organização PrimeSecureLabs

### Permissões Configuradas
- ✅ `AmazonEC2ContainerRegistryFullAccess` - Para push/pull de imagens Docker
- ✅ `AWSAppRunnerFullAccess` - Para deploy automático no App Runner

### Trust Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::012419504148:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:PrimeSecureLabs/*:*"
        }
      }
    }
  ]
}
```

### Limpeza Realizada
- ❌ Removida role `GitHubActions-ECR-Role`
- ❌ Removida role `GitHubActionsRole`
- ❌ Removidos arquivos de configuração antigos:
  - `github-oidc-trust-policy.json`
  - `github-oidc-permissions-policy.json`
  - `universal-github-trust-policy.json`

### Workflow Atualizado
- ✅ GitHub Actions configurado para usar a role universal
- ✅ Não necessita mais secrets `AWS_ROLE_ARN`
- ✅ OIDC hardcoded no workflow para simplicidade

### Status dos Testes
- ✅ Testes passando (2/2)
- ✅ Vitest configurado corretamente
- ✅ Husky e commitlint funcionando
- ✅ Build TypeScript funcionando
- ✅ Docker build corrigido (types adicionados como dependencies)

### Correções de Build Docker
- ✅ Adicionados `@types/bcrypt`, `@types/cors`, `@types/jsonwebtoken` como dependencies
- ✅ Atualizado `tsconfig.json` para excluir arquivos de teste do build
- ✅ TypeScript build funcionando sem erros

## Próximos Passos
1. ✅ Fazer commit das alterações
2. Configurar GitHub Secrets necessários
3. Fazer push para testar o CI/CD
4. Verificar deploy automático no AWS App Runner

## 🔐 GitHub Secrets Necessários
Configure no GitHub → Settings → Secrets and variables → Actions:

- `AWS_REGION`: `us-east-1`
- `ECR_REPOSITORY_SVC_CENTRAL`: `svc-central`

**Nota**: `AWS_ROLE_ARN` não é mais necessário pois está hardcoded no workflow.

## Observações
- Esta role universal pode ser reutilizada em outros repositórios da PrimeSecureLabs
- Não é necessário criar novas roles para novos projetos
- O padrão `repo:PrimeSecureLabs/*:*` permite acesso a todos os repositórios da organização
