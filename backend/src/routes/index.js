const express = require('express');
const authRoutes = require('./auth.routes.js');
const userRoutes = require('./user.routes.js');
const worksheetRoutes = require('./worksheet.routes.js');
const adminRoutes = require('./admin.routes.js');
const subscriptionRoutes = require('./subscription.routes.js');
const subscriptionPlanRoutes = require('./subscription-plan.routes.js');
const settingsRoutes = require('./settings.routes.js');
const healthRoutes = require('./health.routes.js');

const router = express.Router();



router.use((req, res, next) => {

  next();
});

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
router.use('/admin', adminRoutes);
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

module.exports = router;
