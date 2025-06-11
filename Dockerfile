# Use the official Node.js 20 image
FROM node:20.13.1-slim

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first for better caching
COPY package.json ./

# Only copy package-lock.json if it exists
COPY package-lock.json* ./ || true

# Install production dependencies only
RUN npm install --production --no-optional

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 10000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
