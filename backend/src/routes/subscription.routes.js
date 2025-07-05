const express = require('express');
const {
  getCurrentSubscription,
  createCheckoutSession,
  verifyPayment,
  cancelActiveSubscription,
  getAllSubscriptionPlans,
} = require('../controllers/subscription.controller.js');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

// @route   GET /api/subscriptions/current
// @desc    Get the current subscription for the logged-in user
// @access  Private
router.get('/current', protect, getCurrentSubscription);

// @route   GET /api/subscriptions/plans
// @desc    Get all available subscription plans
// @access  Private
router.get('/plans', protect, getAllSubscriptionPlans);

// @route   POST /api/subscriptions/create-checkout-session
// @desc    Create a Stripe checkout session for a subscription
// @access  Private
router.post('/create-checkout-session', protect, createCheckoutSession);

// @route   POST /api/subscriptions/verify-payment
// @desc    Verify a Stripe payment and update the subscription
// @access  Private
router.post('/verify-payment', protect, verifyPayment);

// @route   DELETE /api/subscriptions/current
// @desc    Cancel the current user's active subscription at period end
// @access  Private
router.delete('/current', protect, cancelActiveSubscription);


module.exports = router;
