FROM node:23-alpine AS base
RUN npm install -g pnpm

FROM base AS builder
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/frontend/ ./apps/frontend/
RUN pnpm install --frozen-lockfile
RUN pnpm run --filter frontend build
# RUN pnpm deploy --filter frontend --prod /prod/frontend

FROM nginx:alpine AS prod
# RUN addgroup -S app && adduser -S app -G app
# WORKDIR /home/app/frontend
WORKDIR /app
RUN mkdir dist
COPY --from=builder app/apps/frontend/dist /usr/share/nginx/html
# WORKDIR /home/app/frontend/prod/frontend
# USER app
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
