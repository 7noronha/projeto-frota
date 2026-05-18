# Dockerfile da API NestJS — build a partir da RAIZ do monorepo.
# No Railway: Root Directory = repo root, Dockerfile Path = apps/api/Dockerfile.
#
# ---- build ----
FROM node:22-slim AS build
RUN apt-get update && apt-get install -y openssl curl unzip ca-certificates \
  && rm -rf /var/lib/apt/lists/*
# Pin do bun à versão que mantém o bun.lock (gerado localmente com 1.3.13).
# Versão divergente → --frozen-lockfile falha por diff de formato/conteúdo.
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.13"
ENV PATH="/root/.bun/bin:${PATH}"
WORKDIR /app
COPY . .
# Sem --frozen-lockfile: o autocrlf do Windows altera o EOL do bun.lock
# e o frozen falha no Linux. bun usa o lockfile como base e reconcilia.
RUN bun install
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
