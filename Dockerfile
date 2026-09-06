FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Ensure local dev placeholder .env files never override container environment variables
RUN rm -f .env .env.local .env.production .env.development

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.bundle.mjs"]
