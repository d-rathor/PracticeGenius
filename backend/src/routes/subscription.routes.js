const express = require('express');
const {
  getCurrentSubscription,
  createCheckoutSession,
  verifyPayment,
  getAllSubscriptionPlans,
  cancelActiveSubscription,
  switchPlan
} = require('../controllers/subscription.controller.js');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

// @desc    Get all available subscription plans
router.get('/plans', protect, getAllSubscriptionPlans);

// @desc    Get the current subscription for the logged-in user
router.get('/current', protect, getCurrentSubscription);

// @desc    Create a Stripe checkout session for a subscription
router.post('/create-checkout-session', protect, createCheckoutSession);

// @desc    Verify a Stripe payment and update the subscription
router.post('/verify-payment', protect, verifyPayment);

// @desc    Switch the user's current subscription plan
router.post('/switch-plan', protect, switchPlan);

// @desc    Cancel the current user's active subscription
router.delete('/current', protect, cancelActiveSubscription);

module.exports = router;
