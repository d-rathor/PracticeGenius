const express = require('express');
const router = express.Router();
const { 
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
} = require('../controllers/subscription-plan.controller');
const { auth, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/subscription-plans
 * @desc    Get all subscription plans
 * @access  Public
 */
router.get('/', getAllSubscriptionPlans);

/**
 * @route   POST /api/subscription-plans
 * @desc    Create a new subscription plan
 * @access  Private/Admin
 */
router.post('/', auth, authorize(['admin']), createSubscriptionPlan);

/**
 * @route   GET /api/subscription-plans/:id
 * @desc    Get subscription plan by ID
 * @access  Public
 */
router.get('/:id', getSubscriptionPlanById);

/**
 * @route   PUT /api/subscription-plans/:id
 * @desc    Update subscription plan
 * @access  Private/Admin
 */
router.put('/:id', auth, authorize(['admin']), updateSubscriptionPlan);

/**
 * @route   DELETE /api/subscription-plans/:id
 * @desc    Delete subscription plan
 * @access  Private/Admin
 */
router.delete('/:id', auth, authorize(['admin']), deleteSubscriptionPlan);

module.exports = router;
