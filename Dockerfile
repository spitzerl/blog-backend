# Dockerfile pour l'API Backend Express.js

FROM node:20-alpine AS base

# Installation des dépendances système pour Prisma et monitoring
RUN apk add --no-cache libc6-compat openssl netcat-openbsd wget

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY prisma ./prisma/

# ===== DEPENDENCIES STAGE =====
FROM base AS deps

# Copier package.json et le schéma Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances de production
RUN npm ci --only=production && npm cache clean --force

# ===== DEVELOPMENT DEPENDENCIES STAGE =====
FROM base AS dev-deps

# Installation de toutes les dépendances
RUN npm ci

# ===== BUILD STAGE =====
FROM dev-deps AS build

# Copier le code source
COPY . .

# Variables d'environnement
ENV NODE_ENV=production

# Générer le client Prisma
RUN npx prisma generate

# ===== PRODUCTION STAGE =====
FROM base AS production

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 express

# Copier les dépendances et le code
COPY --from=deps --chown=express:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=express:nodejs /app/ ./

# Créer le dossier uploads et copier les scripts
RUN mkdir -p uploads && chown -R express:nodejs uploads
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && chown express:nodejs /usr/local/bin/docker-entrypoint.sh

USER express

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:3001/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]