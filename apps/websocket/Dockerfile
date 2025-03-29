FROM node:23-alpine AS base
RUN corepack enable pnpm

FROM base AS builder
WORKDIR /app
COPY package.json ./
COPY apps/websocket/package.json ./apps/websocket/
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/api/ ./apps/api/
COPY apps/websocket/src ./apps/websocket/src/
COPY apps/websocket/tsconfig.build.json ./apps/websocket/
COPY apps/websocket/tsconfig.json ./apps/websocket/
COPY packages/ ./packages/

# begin add bun
RUN apk add --no-cache python3 build-base cairo-dev pkgconfig pixman-dev jpeg-dev giflib-dev pango-dev
RUN apk add --no-cache bash curl
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.0"
# ^ need to install bun like this as npm install is currently broken on musl
ENV PATH=$PATH:/root/.bun/bin 
# ^ this is hacky, but we know its going to be in the root
# end add bun

RUN pnpm install --frozen-lockfile
RUN pnpm run --filter websocket build

FROM alpine:latest AS prod
WORKDIR /app
RUN apk add --no-cache libstdc++ libgcc
# ^ needed for bun binary to work
COPY --from=builder /app/apps/websocket/dist/websocket websocket
ENV NODE_ENV=production
CMD ["./websocket"]
EXPOSE 3000
