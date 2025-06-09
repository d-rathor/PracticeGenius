require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Test server is running',
    timestamp: new Date().toISOString(),
    mongoDbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API health check',
    timestamp: new Date().toISOString(),
    mongoDbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start server first, then try MongoDB connection
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  
  // Try MongoDB connection after server is started
  const MONGODB_URI = 'mongodb+srv://devendrarathor:AUhkNDOr3164jhct@practicegenius.leeblag.mongodb.net/?retryWrites=true&w=majority&appName=PracticeGenius';
  console.log(`Attempting to connect to MongoDB Atlas: ${MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`); // Hide credentials in logs
  
  // Set a timeout to prevent hanging if MongoDB is not available
  const mongoTimeout = setTimeout(() => {
    console.log('MongoDB connection attempt timed out. Continuing without MongoDB.');
  }, 10000);
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      clearTimeout(mongoTimeout);
      console.log('MongoDB Atlas connected successfully');
    })
    .catch(err => {
      clearTimeout(mongoTimeout);
      console.error('MongoDB connection error:', err.message);
      console.log('Running server without MongoDB connection. Some features may not work.');
    });
});

// Keep the process alive
console.log('Server process will remain active until manually terminated');
process.stdin.resume();

// Handle errors to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  // Don't exit the process
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  // Don't exit the process
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  mongoose.connection.close().then(() => {
    console.log('MongoDB connection closed.');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  }).catch(() => {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  });
});
