# Sangam Travels — Next.js frontend (App Router, SSR + ISR).
#
# Multi-stage with `output: "standalone"` from next.config.js so the runtime
# stage only carries what server.js actually needs (~150MB vs ~500MB).

# ── deps ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── builder ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure public/ exists even if empty in source — `COPY` in the runner stage
# below would fail if /app/public is missing (empty dirs aren't tracked in git).
RUN mkdir -p /app/public

# NEXT_PUBLIC_* must be present at BUILD time because Next bakes them into the
# client bundle. Compose passes these via args; defaults work for in-cluster
# server-side fetches against the backend service.
ARG NEXT_PUBLIC_API_URL=http://sangam-backend:8000
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_MAPBOX_TOKEN=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN

RUN npm run build

# ── runner ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# sharp is required by Next.js Image optimization in standalone mode.
# Installed AFTER the standalone copy so it lands inside /app/node_modules.
RUN npm install --omit=dev --no-package-lock sharp@^0.33.0 && \
    chown -R nextjs:nodejs /app/node_modules

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
