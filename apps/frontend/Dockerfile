FROM node:23-alpine AS base
RUN corepack enable pnpm

FROM base AS builder
ARG VITE_API_URL
ARG VITE_HASH
ENV API_URL=$VITE_API_URL
ENV VITE_HASH=$VITE_HASH
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/frontend/ ./apps/frontend/
COPY apps/api/ ./apps/api/
COPY apps/websocket/ ./apps/websocket/
COPY packages/ ./packages/
RUN apk add --no-cache python3 build-base cairo-dev pkgconfig pixman-dev jpeg-dev giflib-dev pango-dev
RUN pnpm install --frozen-lockfile
RUN pnpm run --filter frontend build

FROM nginx:alpine AS prod
COPY --from=builder app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/custom_conf/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;", "-c", "/etc/custom_conf/nginx.conf"]
