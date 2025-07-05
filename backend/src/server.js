const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { PORT, MONGODB_URI, NODE_ENV } = require('./config/env');
const { errorHandler, notFound } = require('./middleware/error');
const routes = require('./routes');
const { handleStripeWebhook } = require('./controllers/payment.controller');

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

// Manual CORS Middleware to combat aggressive caching
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Dynamically set the Access-Control-Allow-Origin header
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Crucial for telling caches to vary response by Origin
  res.setHeader('Vary', 'Origin');

  // Add Cache-Control: private as suggested by Render support
  res.setHeader('Cache-Control', 'private');



  // Set other CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-auth-token, Origin, Accept, X-Forwarded-For');
  res.setHeader('Access-Control-Expose-Headers', 'x-auth-token');

  // End preflight requests here
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// The Stripe webhook route must be registered BEFORE express.json()
// to ensure we receive the raw request body for signature verification.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Standard middleware
app.use(express.json()); // Middleware to parse JSON bodies for all other routes
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
