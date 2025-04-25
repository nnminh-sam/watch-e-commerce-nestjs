# Buidler stage
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

# Create logs directory and set permissions
RUN mkdir -p logs && \
    chown -R node:node logs && \
    chmod -R 755 logs

USER node

CMD ["npm", "start"]
