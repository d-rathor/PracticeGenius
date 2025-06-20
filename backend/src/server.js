const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { PORT, MONGODB_URI, NODE_ENV } = require('./config/env');
const { errorHandler, notFound } = require('./middleware/error');

// Initialize express app
const app = express();

// CORS Configuration using the 'cors' package
const allowedOrigins = [
  'https://practicegeniusv2.netlify.app', // Old Netlify frontend
  'https://practicegenius.online',        // New primary custom domain
  'https://www.practicegenius.online',    // New www custom domain
  'http://localhost:3000',                // Local frontend development for testing
  // Add any other specific origins that need access
];

const corsOptions = {
  origin: function (origin, callback) {
    // === START INTENSIVE CORS DEBUGGING ===
    console.log(`[CORS DEBUG] Received request from origin: ${origin}`);
    console.log(`[CORS DEBUG] Server allowedOrigins list: ${JSON.stringify(allowedOrigins)}`);

    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`[CORS DEBUG] SUCCESS: Origin '${origin}' is in the allowed list or is not present. Granting access.`);
      callback(null, true);
    } else {
      console.error(`[CORS DEBUG] FAILURE: Origin '${origin}' is NOT in the allowed list. Denying access.`);
      callback(new Error('Not allowed by CORS: Origin ' + origin + ' is not in the allowed list.'));
    }
    // === END INTENSIVE CORS DEBUGGING ===
  },
  credentials: true, // Allows cookies to be sent and received
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-auth-token', 'Origin', 'Accept', 'X-Forwarded-For'],
  exposedHeaders: ['x-auth-token'],
  maxAge: 86400, // Cache preflight response for 1 day
  optionsSuccessStatus: 204 // Return 204 for successful preflight OPTIONS requests for browsers
};

// Apply CORS middleware globally. The `cors` package handles preflight (OPTIONS) requests automatically.
app.use(cors(corsOptions));

// Forcing OPTIONS route handling can sometimes be useful for complex setups, but usually not needed with `cors` package.
// If issues persist, you might uncomment this, but it's generally handled by app.use(cors(corsOptions)).
// app.options('*', cors(corsOptions)); // Explicitly handle OPTIONS for all routes

// Enhanced CORS test endpoint with detailed debugging
app.get('/test-cors', (req, res) => {
  // console.log('=== CORS Test Endpoint Hit ==='); // Commented out for cleaner logs
  
  // Log all request headers
  // console.log('Request Headers:', JSON.stringify(req.headers, null, 2)); // Commented out for cleaner logs
  
  // Get the origin from the request
  const requestOrigin = req.headers.origin || 'No origin header';
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-auth-token');
  res.setHeader('Access-Control-Expose-Headers', 'x-auth-token');
  res.setHeader('Content-Type', 'application/json');
  
  // Prepare response data
  const responseData = {
    success: true,
    message: 'CORS test successful',
    request: {
      method: req.method,
      url: req.originalUrl,
      origin: requestOrigin,
      headers: req.headers
    },
    server: {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    },
    cors: {
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, x-auth-token'
    }
  };
  
  // Log the response we're about to send
  // console.log('Sending CORS test response:', JSON.stringify(responseData, null, 2)); // Commented out for cleaner logs
  
  // Send the response
  res.status(200).json(responseData);
});

// Add OPTIONS handler for preflight requests
app.options('/test-cors', (req, res) => {
  // console.log('=== CORS Preflight Request ==='); // Commented out for cleaner logs
  // console.log('Preflight Headers:', JSON.stringify(req.headers, null, 2)); // Commented out for cleaner logs
  
  const requestOrigin = req.headers.origin || '*';
  
  res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-auth-token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // console.log('Sending preflight response headers:', { // Commented out for cleaner logs
  //   'Access-Control-Allow-Origin': requestOrigin,
  //   'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  //   'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, x-auth-token'
  // });
  
  res.status(204).send();
});

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

// Import all routes
const routes = require('./routes');

// Mount API routes before starting the server
app.use((req, res, next) => {

  next();
});
app.use('/api', routes);
console.log('All routes mounted successfully');

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



// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const serverInstance = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log(`Health check available at http://0.0.0.0:${PORT}/health`);

  // Attempt MongoDB connection only if not skipped
  if (process.env.SKIP_MONGO !== 'true') {
    console.log('Attempting to connect to MongoDB Atlas...');
    mongoose.connect(MONGODB_URI)
      .then(() => {
        console.log('MongoDB connected successfully');
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        console.log('Running server without MongoDB connection. Some features may not work.');
        // Note: Server is already running. This is just a DB connection failure.
      });
  } else {
    console.log('Skipping MongoDB connection (SKIP_MONGO=true). Server is running.');
  }
});

// Handle server startup errors (e.g., port in use)
serverInstance.on('error', (err) => {
  console.error('Server startup error:', err);
  process.exit(1); // Exit if server can't start
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  mongoose.connection.close().then(() => {
    console.log('MongoDB connection closed.');
    serverInstance.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  }).catch(() => {
    serverInstance.close(() => {
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
