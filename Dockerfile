FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Copy application files
COPY --chown=node:node . .

# Build the app
RUN npm run build

# Start the application
CMD ["npm", "start"]
