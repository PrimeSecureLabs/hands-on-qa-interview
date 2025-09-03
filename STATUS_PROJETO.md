# 🎯 Repositório de Teste QA - PRONTO PARA USO

## ✅ Status Final
- **Data de Conclusão**: 03 de Setembro de 2025
- **Versão**: 1.0 - Produção
- **Status**: Pronto para entrevistas

---

## 📋 Resumo do Projeto

### 🎯 Objetivo
Teste prático para candidatos a QA Pleno/Sênior que avalia:
- Análise de código para identificação de vulnerabilidades
- Metodologia de QA estruturada
- Documentação técnica de qualidade
- Conhecimento em segurança web

### ⏱️ Duração
- **Tempo recomendado**: 90-120 minutos
- **Setup inicial**: 5-10 minutos
- **Análise e testes**: 80-100 minutos
- **Documentação**: 10-15 minutos

---

## 🐛 Problemas Implementados

### Críticos (5 bugs)
1. **SQL Injection** - Query direta sem sanitização
2. **Authentication Bypass** - Token validation falha
3. **CORS Misconfiguration** - Origin wildcard com credentials
4. **Secret Key Exposure** - Chave sensível em header HTTP
5. **Data Validation Skip** - Validações comentadas

### Médios (4 bugs)
6. **Weak Password Policy** - Aceita apenas 3 caracteres
7. **Inadequate Timeout** - 100ms causa falhas
8. **Information Disclosure** - Health check expõe dados
9. **DoS Vulnerability** - Payload 50MB permitido

### Baixos (3 bugs)
10. **Missing Security Headers** - Falta helmet
11. **Insecure Container** - Dockerfile com vulnerabilidades
12. **Error Information Leak** - Detalhes expostos em produção

---

## 📁 Estrutura de Arquivos

### Para Candidatos
- `QA_CHALLENGE.md` - Instruções principais
- `BUGS_TEMPLATE.md` - Template de relatório
- `TEST_PLAN_TEMPLATE.md` - Template de plano de testes
- `README.md` - Guia de setup e execução
- `.env.example` - Configurações de ambiente

### Para Avaliadores
- `BUGS_GABARITO.md` - **CONFIDENCIAL** - Lista completa de bugs
- `AVALIADOR_INSTRUCOES.md` - Critérios de avaliação
- `INSTRUCOES_ENTREVISTADOR.md` - Guia de condução da entrevista

### Código Fonte
```
src/
├── controllers/      # Vulnerabilidades em userController e customerController
├── middlewares/      # Falha de autenticação em authMiddleware
├── services/         # Problemas de timeout e exposição em paymentGateway
├── server.ts         # CORS, payload, health check vulnerabilities
├── models/           # Estruturas de dados (sem bugs intencionais)
└── __tests__/        # Testes base com TODOs para implementação
```

---

## 🛠️ Setup Rápido para Entrevistadores

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar ambiente
cp .env.example .env

# 3. Verificar funcionamento
pnpm test        # 21 testes devem passar
pnpm run build   # Build deve ser bem-sucedido

# 4. Para candidatos: pnpm run dev (falhará sem DB - normal)
```

---

## 📊 Critérios de Avaliação

### Excelente (90-100%)
- Encontra 10+ bugs incluindo todos os críticos
- Metodologia estruturada e documentada
- Implementa testes de validação
- Propõe correções adequadas

### Bom (70-89%)
- Encontra 7-9 bugs incluindo maioria dos críticos
- Boa documentação dos achados
- Metodologia clara
- Algumas propostas de correção

### Satisfatório (50-69%)
- Encontra 5-6 bugs incluindo alguns críticos
- Documenta adequadamente
- Demonstra conhecimento básico de segurança

### Insatisfatório (<50%)
- Encontra menos de 5 bugs
- Não identifica vulnerabilidades críticas
- Metodologia inadequada ou ausente

---

## 🔒 Confidencialidade

### Arquivos Confidenciais
- `BUGS_GABARITO.md` - NUNCA mostrar para candidatos
- `AVALIADOR_INSTRUCOES.md` - Apenas para equipe interna
- `INSTRUCOES_ENTREVISTADOR.md` - Guia para entrevistadores

### Durante a Entrevista
- ❌ NÃO confirmar se achados estão corretos
- ❌ NÃO mencionar quantidade total de bugs
- ❌ NÃO dar dicas sobre localização de problemas
- ✅ Auxiliar apenas com setup técnico

---

## 🚀 Próximos Passos

1. **Para usar em entrevista**:
   - Revise `INSTRUCOES_ENTREVISTADOR.md`
   - Prepare ambiente conforme setup acima
   - Tenha `BUGS_GABARITO.md` à mão (confidencial)

2. **Para candidato**:
   - Forneça acesso ao repositório
   - Indique `QA_CHALLENGE.md` como ponto de partida
   - Monitore sem interferir durante execução

3. **Pós-entrevista**:
   - Use gabarito para comparar achados
   - Documente pontuação e observações
   - Conduza debriefing conforme guia

---

**Repositório validado e pronto para uso em produção! 🎉**

*Criado por: GitHub Copilot | Data: 03/09/2025*
