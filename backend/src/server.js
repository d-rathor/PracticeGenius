const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { PORT, MONGODB_URI, NODE_ENV } = require('./config/env');
const { errorHandler, notFound } = require('./middleware/error');

// Initialize express app
const app = express();

// CORS middleware configuration
const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    'https://practicegeniusv2.netlify.app',
    'http://localhost:3000',
    'https://practicegenius-api.onrender.com'
  ];
  
  const origin = req.headers.origin;
  
  // Log incoming request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, {
    origin,
    method: req.method,
    headers: req.headers
  });
  
  // Always set CORS headers for all responses
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return res.status(204).send();
  }
  
  next();
};

// Apply CORS middleware before any routes
app.use(corsMiddleware);

// Root health check endpoints - must be before all other middleware
app.get('/health', (req, res) => {
  res.status(200).set('Content-Type', 'text/plain').send('OK');
});

// Handle Render's health check with port in URL
app.get('/:port/health', (req, res) => {
  res.status(200).set('Content-Type', 'text/plain').send('OK');
});

// Root path health check
app.get('/', (req, res, next) => {
  if (req.path === '/health' || req.path.endsWith('/health')) {
    return res.status(200).set('Content-Type', 'text/plain').send('OK');
  }
  next();
});

// Log environment variables for debugging
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  FRONTEND_URL: process.env.FRONTEND_URL,
  PORT: process.env.PORT
});

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`, {
    headers: req.headers,
    query: req.query,
    body: req.body
  });
  next();
});

// Logger
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// API health route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Practice Genius API is running',
    timestamp: new Date().toISOString(),
    mongoDbConnected: mongoose.connection.readyState === 1
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Practice Genius API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Import all routes
const routes = require('./routes');

// Mount API routes before starting the server
app.use('/api', routes);
console.log('All routes mounted successfully');

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Start server first, then try MongoDB connection
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log(`Health check available at http://0.0.0.0:${PORT}/health`);
  
  // MongoDB connection is not required for health check
  if (process.env.SKIP_MONGO !== 'true') {
    console.log('Attempting to connect to MongoDB Atlas...');
    mongoose.connect(MONGODB_URI)
      .then(() => {
        console.log('MongoDB connected successfully');
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        console.log('Running server without MongoDB connection. Some features may not work.');
      });
  } else {
    console.log('Skipping MongoDB connection (SKIP_MONGO=true)');
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.name, err.message);
  // Don't exit the process
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.name, err.message);
  // Don't exit the process
});

module.exports = app;
