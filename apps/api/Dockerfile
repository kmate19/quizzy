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

# begin add bun
RUN apk add --no-cache bash curl
RUN curl -fsSL https://bun.sh/install | bash 
# ^ need to install bun like this as npm install is currently broken on musl
ENV PATH=$PATH:/root/.bun/bin 
# ^ this is hacky, but we know its going to be in the root
# end add bun

RUN pnpm install --frozen-lockfile
RUN pnpm run --filter api build

FROM alpine:latest AS prod
WORKDIR /app
RUN apk add --no-cache libstdc++ libgcc
# ^ needed for bun binary to work
COPY --from=builder /app/apps/api/api api
ENV NODE_ENV=production
CMD ["./api"]
EXPOSE 3000
