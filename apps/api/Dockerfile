# Dockerfile da API NestJS — build a partir da RAIZ do monorepo.
# No Railway: Root Directory = repo root, Dockerfile Path = apps/api/Dockerfile.
#
# ---- build ----
FROM node:22-slim AS build
RUN apt-get update && apt-get install -y openssl curl unzip ca-certificates \
  && rm -rf /var/lib/apt/lists/*
# Pin do bun à versão do packageManager/lockfile (bun.lock gerado com 1.2.0).
# Sem pin instala a mais recente e --frozen-lockfile falha por diff de formato.
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.0"
ENV PATH="/root/.bun/bin:${PATH}"
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN cd apps/api && bunx prisma generate
RUN bunx turbo run build --filter=@fleetops/api

# ---- runtime ----
FROM node:22-slim AS run
RUN apt-get update && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
# node_modules (com @prisma/client gerado) + artefatos necessários
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
WORKDIR /app/apps/api
# Railway injeta PORT; a API lê PORT (ver main.ts). Migrations aplicadas no boot.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
