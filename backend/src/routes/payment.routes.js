const express = require('express');
const router = express.Router();
const { createCheckoutSession, verifyPaymentSession } = require('../controllers/payment.controller');
// Assuming an auth middleware exists at this path to protect routes
const { protect } = require('../middleware/auth');

// The checkout session creation should be protected, ensuring only logged-in users can create a session.


// @route   POST /api/payments/verify-payment-session
// @desc    Verify a Stripe Checkout session and update subscription status
// @access  Private
router.post('/verify-payment-session', protect, verifyPaymentSession);

module.exports = router;