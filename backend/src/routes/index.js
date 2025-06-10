const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const worksheetRoutes = require('./worksheet.routes');
const subscriptionRoutes = require('./subscription.routes');
const subscriptionPlanRoutes = require('./subscription-plan.routes');
const settingsRoutes = require('./settings.routes');
const healthRoutes = require('./health.routes');

// Health check route (must be first)
router.use(healthRoutes);

// Welcome route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Practice Genius API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Mount routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/worksheets', worksheetRoutes);
router.use('/api/subscriptions', subscriptionRoutes);
router.use('/api/subscription-plans', subscriptionPlanRoutes);
router.use('/api/settings', settingsRoutes);

module.exports = router;
