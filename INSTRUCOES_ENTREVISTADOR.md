# Instruções para o Entrevistador - Teste de QA

## 📋 Preparação Antes da Entrevista

### 1. Setup do Ambiente
```bash
# Clone o repositório (se necessário)
git clone <repo-url>
cd teste-pratico

# Instale as dependências
pnpm install

# Copie o arquivo de ambiente
cp .env.example .env

# Execute os testes para verificar se tudo está funcionando
pnpm test

# Teste o build
pnpm run build
```

### 2. Documentos Importantes
- **QA_CHALLENGE.md** - Instruções para o candidato
- **BUGS_GABARITO.md** - Lista completa dos 12 bugs (CONFIDENCIAL)
- **AVALIADOR_INSTRUCOES.md** - Critérios de avaliação detalhados
- **BUGS_TEMPLATE.md** - Template que o candidato deve usar
- **TEST_PLAN_TEMPLATE.md** - Template de plano de testes

---

## 🎯 Durante a Entrevista

### Briefing Inicial (5 minutos)
1. **Apresente o cenário**: "Você foi contratado como QA para avaliar este sistema antes do lançamento"
2. **Explique o tempo**: 90-120 minutos
3. **Mostre os templates**: Explique que devem usar os templates fornecidos
4. **Esclareça dúvidas** sobre o processo (não sobre bugs específicos)

### Observação Durante o Teste
**Monitore sem interferir:**
- Metodologia de análise
- Ordem de investigação
- Uso de ferramentas
- Documentação dos achados
- Testes práticos realizados

### Perguntas Permitidas do Candidato
✅ **Pode responder:**
- Como configurar o ambiente
- Esclarecimentos sobre requisitos
- Problemas técnicos de setup
- Dúvidas sobre templates

❌ **NÃO responda:**
- Dicas sobre onde estão bugs
- Confirmação se algo é ou não um bug
- Sugestões de ferramentas específicas
- Orientações sobre priorização

---

## 🔍 Bugs a Observar

### Críticos (Deve encontrar pelo menos 3-4)
1. **SQL Injection** - `userController.ts:490`
2. **Auth Bypass** - `authMiddleware.ts:28`  
3. **CORS Inseguro** - `server.ts:58-61`
4. **Secret Exposure** - `paymentGatewayService.ts:47`
5. **Validation Skip** - `customerController.ts:146-150`

### Médios (Bom se encontrar 2-3)
6. **Weak Password** - `userController.ts:44`
7. **Low Timeout** - `paymentGatewayService.ts:44`
8. **Info Leak** - `server.ts:77-78`
9. **Large Payload** - `server.ts:64`

### Baixos (Excelente se encontrar)
10. **Missing Helmet** - `server.ts:1-10`
11. **Insecure Docker** - `Dockerfile:1-15`
12. **Error Details** - `server.ts:85`

---

## 📊 Avaliação Final

### Critérios de Pontuação
- **Bugs Encontrados** (40%) - Quantidade e severidade
- **Metodologia** (25%) - Processo estruturado e lógico
- **Documentação** (20%) - Qualidade dos relatórios
- **Testes Práticos** (15%) - Validação hands-on

### Classificação
- **90-100%**: Excelente - Encontrou 10+ bugs, metodologia sólida
- **70-89%**: Bom - Encontrou 7-9 bugs, boa documentação
- **50-69%**: Satisfatório - Encontrou 5-6 bugs críticos
- **<50%**: Insatisfatório - Poucos bugs ou metodologia fraca

---

## 🎬 Debriefing (15 minutos)

### Discussão Pós-Teste
1. **Peça feedback** sobre a experiência
2. **Discuta achados** - O que encontrou vs. o que perdeu
3. **Explore metodologia** - Como organizou a investigação
4. **Avalie raciocínio** - Por que priorizou certas áreas

### Perguntas Sugeridas
- "Como você organizou sua análise?"
- "Que ferramentas usou e por quê?"
- "Qual bug considera mais crítico?"
- "O que faria diferente com mais tempo?"
- "Como priorizaria as correções?"

---

## ⚠️ Lembretes Importantes

- **NÃO mencione** a quantidade total de bugs (12)
- **NÃO confirme** se achados estão corretos durante o teste
- **Mantenha neutralidade** - deixe o candidato conduzir
- **Observe soft skills** - comunicação, organização, persistência
- **Documente observações** para feedback posterior

---

**Boa sorte com a entrevista!** 🍀
