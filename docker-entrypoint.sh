#!/bin/sh
set -e

# ==============================================================================
# Entrypoint Script - Mobogo Admin Panel (Frontend)
# Injeção dinâmica de variáveis de ambiente em runtime, portas e inicialização
# ==============================================================================

# 1. Configuração de Porta Dinâmica (Compatível com Docker Compose, Render, Railway, Cloud Run)
SERVER_PORT="${PORT:-8080}"
if [ "$SERVER_PORT" != "8080" ]; then
    echo "[Entrypoint] Configurando porta do Nginx para $SERVER_PORT..."
    sed -i "s|listen 8080;|listen $SERVER_PORT;|g" /etc/nginx/conf.d/default.conf
fi

# 2. Injeção Dinâmica de Variáveis de Ambiente em Runtime
# Permite que a MESMA imagem Docker rode em múltiplos ambientes (Dev, Staging, Produção)
# apenas fornecendo a variável de ambiente VITE_API_URL sem necessidade de rebuild.
MARKER_FILE="/usr/share/nginx/html/.built_api_url"
BUILT_URL=""

if [ -f "$MARKER_FILE" ]; then
    BUILT_URL=$(cat "$MARKER_FILE" 2>/dev/null || true)
fi

if [ -z "$BUILT_URL" ]; then
    BUILT_URL="http://localhost:8000/api"
fi

# Detecta a URL em tempo de execução (com fallbacks flexíveis)
RUNTIME_URL="${VITE_API_URL:-${API_URL:-${BACKEND_URL:-$BUILT_URL}}}"

# Normaliza removendo barras finais redundantes (evita URL//v1)
RUNTIME_URL="${RUNTIME_URL%/}"
BUILT_URL="${BUILT_URL%/}"

# Aplica substituição nos bundles compilados se a URL informada for diferente da embutida no build
if [ -n "$RUNTIME_URL" ] && [ "$RUNTIME_URL" != "$BUILT_URL" ]; then
    echo "[Entrypoint] Atualizando API URL de '$BUILT_URL' para '$RUNTIME_URL' nos bundles estáticos..."
    find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|$BUILT_URL|$RUNTIME_URL|g" {} +
    echo "$RUNTIME_URL" > "$MARKER_FILE"
fi

# Gera runtime config auxiliar caso scripts futuros acessem window.__ENV__
cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_API_URL: "${RUNTIME_URL}"
};
EOF

# 3. Banner Informativo de Inicialização
echo "=========================================================="
echo "  🚀 Mobogo Admin Panel (Frontend)"
echo "=========================================================="
echo "  Porta HTTP:     ${SERVER_PORT}"
echo "  API Backend:    ${RUNTIME_URL}"
echo "  Usuário:        $(whoami 2>/dev/null || echo 'nginx') [UID $(id -u 2>/dev/null || echo '101')]"
echo "  Servidor Web:   Nginx Unprivileged (Alta Performance)"
echo "=========================================================="

# 4. Executa o comando principal (PID 1 para permitir graceful shutdown)
exec "$@"
