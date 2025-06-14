const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const worksheetRoutes = require('./worksheet.routes');
const subscriptionRoutes = require('./subscription.routes');
const subscriptionPlanRoutes = require('./subscription-plan.routes');
const settingsRoutes = require('./settings.routes');
const healthRoutes = require('./health.routes');

// CORS middleware for API routes
const apiCors = (req, res, next) => {
  const allowedOrigins = [
    'https://practicegeniusv2.netlify.app',
    'http://localhost:3000',
    'https://practicegenius-api.onrender.com',
    'http://localhost:3001',
    'https://practicegenius.netlify.app'
  ];

  const origin = req.headers.origin;
  const requestOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'x-auth-token');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-auth-token');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).send();
  }

  next();
};

// Apply CORS to all API routes
router.use(apiCors);

// Health check route (must be first)
router.use(healthRoutes);

// Welcome route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Practice Genius API',
    version: '1.0.0',
    documentation: '/api/docs',
    cors: {
      allowedOrigins: [
        'https://practicegeniusv2.netlify.app',
        'http://localhost:3000',
        'https://practicegenius-api.onrender.com',
        'http://localhost:3001',
        'https://practicegenius.netlify.app'
      ],
      currentOrigin: req.headers.origin || 'No origin header'
    }
  });
});

// Mount routes with CORS
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/worksheets', worksheetRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/subscription-plans', subscriptionPlanRoutes);
router.use('/settings', settingsRoutes);

// Handle 404 for API routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('API Error:', err);
  
  // Handle CORS error specifically
  if (err.name === 'CorsError') {
    return res.status(403).json({
      success: false,
      error: 'Not allowed by CORS',
      details: {
        origin: req.get('origin'),
        method: req.method,
        allowedOrigins: [
          'https://practicegeniusv2.netlify.app',
          'http://localhost:3000',
          'https://practicegenius-api.onrender.com',
          'http://localhost:3001',
          'https://practicegenius.netlify.app'
        ]
      }
    });
  }

  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

module.exports = router;
