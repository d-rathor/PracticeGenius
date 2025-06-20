const express = require('express');
const {
  getAllSubscriptions,
  getCurrentSubscription,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  getRecentSubscriptions,
  getAllSubscriptionPlans,
  deleteSubscription
} = require('../controllers/subscription.controller.js');
const { auth, authorize } = require('../middleware/auth.js');

const router = express.Router();

router
  .route('/')
  .get(auth, authorize(['admin']), getAllSubscriptions)
  .post(auth, createSubscription);

router.get('/current', auth, getCurrentSubscription);
router.get('/recent', auth, authorize(['admin']), getRecentSubscriptions);
router.get('/plans', auth, getAllSubscriptionPlans);

router
  .route('/:id')
  .get(auth, getSubscriptionById)
  .put(auth, authorize(['admin']), updateSubscription)
  .delete(auth, authorize(['admin']), deleteSubscription);

router.put('/:id/cancel', auth, cancelSubscription);
router.put('/:id/renew', auth, renewSubscription);

module.exports = router;
