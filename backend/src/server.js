const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { PORT, MONGODB_URI, NODE_ENV } = require('./config/env');
const { errorHandler, notFound } = require('./middleware/error');

// Initialize express app
const app = express();

// Root health check endpoint for Render - must be before all other middleware
app.get('/health', (req, res) => {
  res.status(200).set('Content-Type', 'text/plain').send('OK');
});

// Middleware
// Configure CORS to accept all origins during development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Mount API routes before starting the server
try {
  const routes = require('./routes');
  app.use('/', routes);
  console.log('All routes mounted successfully');
} catch (routeError) {
  console.error('Failed to mount routes:', routeError);
}

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
