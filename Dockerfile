# Use the official Node.js 20 image
FROM node:20.13.1-slim as builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./


# Install all dependencies first (including devDependencies)
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application (if needed)
# RUN npm run build

# Production stage
FROM node:20.13.1-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --production --no-optional

# Copy built application from builder
COPY --from=builder /usr/src/app .

# Expose the port the app runs on
EXPOSE 10000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "backend/src/server.js"]
