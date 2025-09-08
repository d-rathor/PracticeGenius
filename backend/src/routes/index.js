const express = require('express');
const authRoutes = require('./auth.routes.js');
const userRoutes = require('./user.routes.js');
const worksheetRoutes = require('./worksheet.routes.js');
const adminRoutes = require('./admin.routes.js');
const subscriptionRoutes = require('./subscription.routes.js');
const paymentRoutes = require('./payment.routes.js');
const subscriptionPlanRoutes = require('./subscription-plan.routes.js');
const settingsRoutes = require('./settings.routes.js');
const healthRoutes = require('./health.routes.js');
const googleDriveRoutes = require('./googleDrive.routes.js');
const localFolderRoutes = require('./localFolder.routes.js');

const router = express.Router();





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
router.use('/payments', paymentRoutes);
router.use('/subscription-plans', subscriptionPlanRoutes);
router.use('/settings', settingsRoutes);
router.use('/google-drive', googleDriveRoutes);
router.use('/local-folder', localFolderRoutes);

// Handle 404 for API routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

module.exports = router;
