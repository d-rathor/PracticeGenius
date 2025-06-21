const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { PORT, MONGODB_URI, NODE_ENV } = require('./config/env');
const { errorHandler, notFound } = require('./middleware/error');
const routes = require('./routes');

// Initialize express app
const app = express();

// CORS Configuration
const allowedOrigins = [
  'https://practicegeniusv2.netlify.app', // Old Netlify frontend
  'https://practicegenius.online',        // New primary custom domain
  'https://www.practicegenius.online',    // New www custom domain
  'http://localhost:3000',                // Local frontend development
  'http://localhost:3001',                // Local frontend development (alternative port)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // or if the origin is in our allowed list.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin not allowed: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-auth-token', 'Origin', 'Accept', 'X-Forwarded-For'],
  exposedHeaders: ['x-auth-token'],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Add Vary: Origin header to all responses to help with caching
app.use(function(req, res, next) {
  res.setHeader('Vary', 'Origin');
  next();
});

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger
if (NODE_ENV === 'development') {
  app.use(require('morgan')('dev'));
}

// Mount API routes
app.use('/api', routes);
console.log('All routes mounted successfully');

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Practice Genius API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const serverInstance = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);

  // Attempt MongoDB connection
  console.log('Attempting to connect to MongoDB Atlas...');
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('MongoDB connected successfully');
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
    });
});

// Handle server startup errors
serverInstance.on('error', (err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  serverInstance.close(() => {
    console.log('HTTP server closed.');
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

module.exports = app;
