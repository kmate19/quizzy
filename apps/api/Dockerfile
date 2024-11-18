FROM node:23-alpine AS base
RUN corepack enable pnpm

FROM base AS builder
WORKDIR /app
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/api/src ./apps/api/src/
COPY apps/api/tsconfig.json ./apps/api/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile
RUN pnpm run --filter api build
RUN pnpm deploy --filter api --prod /prod/api

FROM base AS prod
RUN addgroup -S app && adduser -S app -G app
WORKDIR /home/app/api
COPY --from=builder /prod/api ./
RUN rm -rf src tsconfig.json
EXPOSE 3000
USER app
CMD ["pnpm", "start"]
