# Builder stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/tsconfig*.json ./
COPY --from=builder /usr/src/app/templates ./templates

# Create logs and uploads directories with proper permissions
RUN mkdir -p logs uploads && \
    chown -R node:node logs uploads && \
    chmod -R 755 logs uploads

USER node

CMD ["npm", "start"]