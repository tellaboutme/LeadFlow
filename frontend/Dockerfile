# syntax=docker/dockerfile:1

# ---- Build stage: produce the production bundle ------------------------------
FROM node:22-alpine AS builder

# @playwright/test is a devDependency (needed because vite.config.ts imports the
# Vitest browser provider), but the E2E browsers are never needed to build.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    CI=true

WORKDIR /app

# Dependencies come from the lockfile alone, so this layer stays cached until
# package-lock.json changes. .npmrc is required here: it sets legacy-peer-deps,
# without which npm ci fails on the openapi-typescript/typescript peer conflict.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .

# VITE_API_BASE_URL is deliberately left empty: the app then calls the API with
# relative URLs, which nginx proxies to the backend (same-origin, no CORS).
RUN npm run build


# ---- Runtime stage: static files behind nginx --------------------------------
# The unprivileged image runs as a non-root user and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# The base image ships Alpine packages with known fixable CVEs (zlib, nghttp2,
# musl). Patch them at build time; this needs root, so drop back afterwards.
USER root
RUN apk upgrade --no-cache
USER nginx

COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=5 \
    CMD ["wget", "--quiet", "--spider", "http://127.0.0.1:8080/"]
