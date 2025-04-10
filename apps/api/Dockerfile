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
COPY apps/api/tsconfig.build.json ./apps/api/
COPY apps/api/drizzle.config.ts ./apps/api/
COPY apps/api/migrations ./apps/api/migrations/
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

RUN pnpm run --filter api build:bun

FROM alpine:latest AS prod
WORKDIR /app

RUN apk add --no-cache libstdc++ libgcc font-liberation ttf-dejavu python3 build-base cairo-dev pkgconfig pixman-dev jpeg-dev giflib-dev pango-dev
# ^ needed for bun binary to work
COPY --from=builder /app/apps/api/dist/api api
COPY --from=builder /app/apps/api/migrations/ migrations/
CMD ["./api"]
EXPOSE 3000
