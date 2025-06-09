const express = require('express');
const router = express.Router();
const { 
  getAllSubscriptions,
  getCurrentSubscription,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  getRecentSubscriptions
} = require('../controllers/subscription.controller');
const { auth, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/subscriptions
 * @desc    Get all subscriptions with pagination
 * @access  Private/Admin
 */
router.get('/', auth, authorize(['admin']), getAllSubscriptions);

/**
 * @route   GET /api/subscriptions/current
 * @desc    Get current user's subscription
 * @access  Private
 */
router.get('/current', auth, getCurrentSubscription);

/**
 * @route   GET /api/subscriptions/recent
 * @desc    Get recent subscriptions
 * @access  Private/Admin
 */
router.get('/recent', auth, authorize(['admin']), getRecentSubscriptions);

/**
 * @route   POST /api/subscriptions
 * @desc    Create a new subscription
 * @access  Private
 */
router.post('/', auth, createSubscription);

/**
 * @route   GET /api/subscriptions/:id
 * @desc    Get subscription by ID
 * @access  Private/Admin or Subscription Owner
 */
router.get('/:id', auth, getSubscriptionById);

/**
 * @route   PUT /api/subscriptions/:id
 * @desc    Update subscription
 * @access  Private/Admin
 */
router.put('/:id', auth, authorize(['admin']), updateSubscription);

/**
 * @route   PUT /api/subscriptions/:id/cancel
 * @desc    Cancel subscription
 * @access  Private/Admin or Subscription Owner
 */
router.put('/:id/cancel', auth, cancelSubscription);

/**
 * @route   PUT /api/subscriptions/:id/renew
 * @desc    Renew subscription
 * @access  Private/Admin or Subscription Owner
 */
router.put('/:id/renew', auth, renewSubscription);

module.exports = router;
