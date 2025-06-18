# Use the official Node.js 20 image for the final stage
FROM node:20.13.1-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy backend's package.json and package-lock.json
# This ensures we use the backend's specific dependencies
COPY backend/package.json backend/package-lock.json ./backend/

# Change working directory to backend. 
# Subsequent commands (like npm install and COPY) will be relative to this path.
WORKDIR /usr/src/app/backend

# Install only production dependencies for the backend
# This will create /usr/src/app/backend/node_modules
RUN npm install --production --no-optional

# Copy the backend application's server.js and src directory
COPY backend/server.js ./server.js 
COPY backend/src ./src/

# Expose the port the app runs on (ensure this matches your app's configuration)
EXPOSE 10000

# Set NODE_ENV to production (good practice, though Render might also set this)
ENV NODE_ENV=production

# Define the command to run your app
# WORKDIR is /usr/src/app/backend
CMD ["node", "src/server.js"]
