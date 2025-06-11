# Use the official Node.js 20 image
FROM node:20.13.1-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./


# Install dependencies
RUN npm install --production

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 10000

# Start the server
CMD [ "node", "server.js" ]
