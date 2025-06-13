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

# Copy the rest of the backend application source code
# This copies the contents of your local 'backend/src' directory 
# into '/usr/src/app/backend/src' in the image.
COPY backend/src ./src/

# Expose the port the app runs on (ensure this matches your app's configuration)
EXPOSE 10000

# Set NODE_ENV to production (good practice, though Render might also set this)
ENV NODE_ENV=production

# Define the command to run your app
# WORKDIR is /usr/src/app/backend, so server.js is at src/server.js
CMD ["node", "src/server.js"]
