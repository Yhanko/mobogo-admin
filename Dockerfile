# syntax=docker/dockerfile:1

# ==============================================================================
# Dockerfile - Mobogo Admin Panel (Frontend SPA)
# Multi-stage, ultra-otimizado, performático, seguro e escalável
# Stack: Node.js 22 (Alpine) -> Vite + React + TypeScript -> Nginx Unprivileged
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Base Stage: Runtime minimalista Node.js oficial sobre Alpine Linux
# ------------------------------------------------------------------------------
FROM node:22-alpine AS base

WORKDIR /app

# ------------------------------------------------------------------------------
# 2. Dependencies Stage: Instalação com cache acelerado do BuildKit e resiliência
# ------------------------------------------------------------------------------
FROM base AS deps

# Copia apenas os manifestos de dependência para maximizar o cache de camadas
COPY package.json package-lock.json ./

# Configura resiliência de rede e instala com cache local do npm
RUN --mount=type=cache,target=/root/.npm \
    npm config set legacy-peer-deps true && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --prefer-offline --no-audit --legacy-peer-deps

# ------------------------------------------------------------------------------
# 3. Builder Stage: Compilação dos bundles estáticos via Vite
# ------------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Reutiliza dependências instaladas no estágio deps
COPY --from=deps /app/node_modules ./node_modules

# Copia o código-fonte da aplicação
COPY . .

# Argumento de build para configurar a URL da API do backend
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL

# Compila o projeto para produção e guarda a URL embutida para substituição dinâmica no runtime
RUN npm run build && echo "$VITE_API_URL" > /app/dist/.built_api_url

# ------------------------------------------------------------------------------
# 4. Runner Stage: Servidor Web Nginx seguro e sem privilégios (Non-Root)
# ------------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:alpine-slim AS runner

# Metadados OCI da imagem
LABEL maintainer="Mobogo Team" \
      project="mobogo-admin" \
      description="Mobogo Admin Frontend Production Image" \
      version="1.0.0"

USER root

# Copia a configuração otimizada e blindada do Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os artefatos compilados da aplicação
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia o script de inicialização e suporte a variáveis dinâmicas em runtime
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Normaliza quebras de linha CRLF (compatibilidade Windows/Linux), permissões e propriedade para UID 101 (nginx)
RUN sed -i 's/\r$//' /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh && \
    chown -R 101:101 /usr/share/nginx/html /etc/nginx/conf.d /docker-entrypoint.sh

# Retorna estritamente para o usuário não-privilegiado (UID 101)
USER 101

# Porta padrão de escuta não-privilegiada
EXPOSE 8080

# Verificação contínua de saúde da aplicação (Healthcheck nativo com wget)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

# Entrypoint dinâmico para injeção de variáveis de ambiente e ajuste de porta
ENTRYPOINT ["/docker-entrypoint.sh"]

# Inicialização do Nginx em primeiro plano (foreground)
CMD ["nginx", "-g", "daemon off;"]
