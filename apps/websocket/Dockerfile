FROM node:23-alpine AS base
RUN npm install -g pnpm

FROM base AS builder
WORKDIR /app
COPY package.json ./
COPY apps/websocket/package.json ./apps/websocket/
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/websocket/src ./apps/websocket/src/
COPY apps/websocket/tsconfig.json ./apps/websocket/
COPY packages/ ./packages/
# RUN npm install -g typescript
RUN pnpm install --frozen-lockfile
RUN pnpm run --filter websocket build
RUN pnpm deploy --filter websocket --prod /prod/websocket

FROM base AS prod
RUN addgroup -S app && adduser -S app -G app
WORKDIR /home/app/websocket
COPY --from=builder /prod/websocket ./
RUN rm -rf src package.json tsconfig.json
EXPOSE 3000
USER app
CMD ["pnpm", "start"]
