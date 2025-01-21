FROM node:23-alpine AS base
RUN corepack enable pnpm

FROM base AS builder
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/frontend/ ./apps/frontend/
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile
RUN pnpm run --filter frontend build

FROM nginx:alpine AS prod
COPY --from=builder app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/custom_conf/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;", "-c", "/etc/custom_conf/nginx.conf"]
