# syntax=docker.io/docker/dockerfile-upstream:1.20.0
# check=error=true

# =============================================================================
# Angular SPA Frontend - Multi-Stage Dockerfile
# =============================================================================
# Aufruf:   docker build --tag buchhandlung/frontend:2025.10.1 .
#               ggf. --progress=plain
#               ggf. --no-cache
#           docker run -p 80:80 buchhandlung/frontend:2025.10.1

ARG NODE_VERSION=22.12.0

# =============================================================================
# Stage 1: Build - Angular App kompilieren
# =============================================================================
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

# pnpm via npm installieren (zuverlässiger als corepack)
RUN npm install -g pnpm@latest

# Dependency-Dateien kopieren für besseres Caching
COPY package.json pnpm-lock.yaml* ./

# Dependencies installieren (--no-frozen-lockfile falls keine lockfile existiert)
RUN pnpm install || pnpm install --no-frozen-lockfile

# Source-Code kopieren
COPY . .

# Angular App für Production bauen
RUN pnpm build --configuration=production

# =============================================================================
# Stage 2: Production - Nginx Webserver
# =============================================================================
FROM nginx:1.27-alpine AS production

# Nginx-Konfiguration für SPA (Client-Side Routing)
COPY nginx.conf /etc/nginx/nginx.conf

# Build-Artefakte von Stage 1 kopieren
COPY --from=build /app/dist/spa-frontend /usr/share/nginx/html

# Nginx läuft als non-root User
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# Port 80 exponieren
EXPOSE 80

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]
