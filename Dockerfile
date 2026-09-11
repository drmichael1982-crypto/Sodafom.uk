FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack enable \
    && corepack prepare pnpm@11.23.0 --activate \
    && pnpm install --frozen-lockfile

COPY . .

# Ensure local dev placeholder .env files never override container environment variables
RUN rm -f .env .env.local .env.production .env.development

RUN pnpm run build

EXPOSE 8080

CMD ["node", "dist/server.bundle.mjs"]
