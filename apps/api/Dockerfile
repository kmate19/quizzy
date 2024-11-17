FROM node:23-alpine AS base
RUN npm install -g pnpm

FROM base AS builder
WORKDIR /app
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/
RUN npm install -g typescript
RUN pnpm install --frozen-lockfile
RUN pnpm run --filter api build
RUN pnpm deploy --filter api --prod /prod/api

FROM base AS prod
RUN addgroup -S app && adduser -S app -G app
WORKDIR /home/app/api
COPY --from=builder /prod/api ./
WORKDIR /home/app/api/prod/api
EXPOSE 3000
USER app
CMD ["pnpm", "start"]
