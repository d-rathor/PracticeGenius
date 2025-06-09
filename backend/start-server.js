require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// Default environment variables if not provided in .env
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
// MongoDB URI - Use MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://devendrarathor:AUhkNDOr3164jhct@practicegenius.leeblag.mongodb.net/?retryWrites=true&w=majority&appName=PracticeGenius';
const JWT_SECRET = process.env.JWT_SECRET || 'practicegenius-dev-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Print startup information
console.log('Starting Practice Genius Backend Server');
console.log('--------------------------------------');
console.log(`Environment: ${NODE_ENV}`);
console.log(`Port: ${PORT}`);
console.log(`MongoDB URI: ${MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`); // Hide credentials
console.log(`Frontend URL: ${FRONTEND_URL}`);
console.log('--------------------------------------');

// Set environment variables for the child process
const env = {
  ...process.env,
  PORT,
  NODE_ENV,
  MONGODB_URI,
  JWT_SECRET,
  FRONTEND_URL
};

console.log('Starting server process with MongoDB Atlas connection...');

// Start the server
const server = spawn('node', [path.join(__dirname, 'src', 'server.js')], {
  env,
  stdio: 'inherit',
  detached: false // Keep the child process attached to the parent
});

// Handle server process events
server.on('error', (err) => {
  console.error('Failed to start server:', err);
  // Don't exit the process, just log the error
});

server.on('exit', (code, signal) => {
  console.log(`Server process exited with code ${code} and signal ${signal}`);
  if (code !== 0 && code !== null) {
    console.error(`Server process exited with error code ${code}`);
    // Don't exit the process, just log the error
  }
});

// Keep the parent process running
console.log('Parent process will remain active to keep server running');
process.stdin.resume(); // Keep the process alive

// Handle process termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  server.kill('SIGTERM');
});
