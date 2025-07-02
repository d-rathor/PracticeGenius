# Stage 1: Use an official Node.js runtime as a parent image
# Using node:18-slim which is a good balance of size and functionality.
FROM node:18-slim

# Install ImageMagick, which is required for PDF preview generation.
# The --no-install-recommends flag keeps the image size smaller.
RUN apt-get update && apt-get install -y imagemagick --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker layer caching.
# This means 'npm install' will only re-run if these files change.
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code into the container
COPY . .

# The application listens on port 8080. Render will automatically map its
# public port (10000) to this one via the PORT environment variable.
EXPOSE 8080

# Define the command to run the application.
# This uses the 'src/server.js' entrypoint as defined in your package.json.
CMD [ "node", "server.js" ]
