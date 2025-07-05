const express = require('express');
const router = express.Router();
const { 
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
} = require('../controllers/subscription-plan.controller.js');
const { protect: auth, authorize } = require('../middleware/auth.js');

// Public route to get all subscription plans
router.get('/', getAllSubscriptionPlans);

// Admin routes for managing subscription plans
router.post('/', auth, authorize(['admin']), createSubscriptionPlan);
router.get('/:id', auth, authorize(['admin']), getSubscriptionPlanById);
router.put('/:id', auth, authorize(['admin']), updateSubscriptionPlan);
router.delete('/:id', auth, authorize(['admin']), deleteSubscriptionPlan);

module.exports = router;
