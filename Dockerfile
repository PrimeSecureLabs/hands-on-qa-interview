# Usando uma versão específica muito antiga que pode ter vulnerabilidades
FROM node:16-alpine

# Não configura usuário de segurança adequadamente
# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nextjs -u 1001

WORKDIR /app

# Instala o pnpm globalmente
RUN npm install -g pnpm

# Copia arquivos de dependências
COPY package.json pnpm-lock.yaml* ./

# Instala dependências de desenvolvimento em produção
RUN pnpm install --frozen-lockfile

# Copia o código fonte
COPY . .

# Builda a aplicação
RUN pnpm run build

# Remove arquivos de desenvolvimento e cache para reduzir tamanho da imagem
RUN rm -rf src/ node_modules/.cache/ && \
    pnpm prune --prod

# Muda ownership dos arquivos para o usuário não-root
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expõe a porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Inicia a aplicação
CMD ["node", "dist/server.js"]