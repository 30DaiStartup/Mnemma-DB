# syntax=docker/dockerfile:1

# --- Base ---
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- Prisma generate ---
FROM deps AS prisma
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY .env.example .env
RUN npx prisma generate

# --- Build ---
FROM prisma AS builder
COPY . .
# Use the generated prisma client from the prisma stage
RUN npm run build

# --- Production ---
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma schema + migrations for runtime migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Copy data directory (YAML configs)
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

# Create directory for SQLite database volume
RUN mkdir -p /app/db && chown nextjs:nodejs /app/db

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
