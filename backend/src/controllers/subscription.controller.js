const Subscription = require('../models/subscription.model.js');
const SubscriptionPlan = require('../models/subscription-plan.model.js');
const User = require('../models/user.model.js');
const ApiError = require('../utils/ApiError.js');
const asyncHandler = require('../utils/async-handler.js');

/**
 * @desc    Get all subscriptions with pagination
 * @route   GET /api/subscriptions
 * @access  Private/Admin
 */
const getAllSubscriptions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const subscriptions = await Subscription.find()
    .populate('user', 'name email')
    .populate('plan', 'name price billingCycle')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Subscription.countDocuments();

  res.json({
    success: true,
    data: subscriptions,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get current user's subscription
 * @route   GET /api/subscriptions/current
 * @access  Private
 */
const getCurrentSubscription = asyncHandler(async (req, res) => {

  // 1. Prioritize the user's activeSubscription field
  if (req.user.activeSubscription) {
    const activeSub = await Subscription.findById(req.user.activeSubscription).populate('plan');


    // 2. If it exists and is still active, return it. This is the happy path.
    if (activeSub && activeSub.status === 'active') {
      return res.status(200).json({ success: true, data: activeSub });
    }
  }

  // 3. Fallback / Self-healing logic if the pointer is stale or doesn't exist.
  // Try to find the latest active subscription in the collection.

  const latestActiveSub = await Subscription.findOne({
    user: req.user.id,
    status: 'active',
  })
    .sort({ createdAt: -1 })
    .populate('plan');

  // 4. If we found a different active subscription, update the user pointer and return it.
  if (latestActiveSub) {
    await User.findByIdAndUpdate(req.user.id, { activeSubscription: latestActiveSub._id });
    return res.status(200).json({ success: true, data: latestActiveSub });
  }

  // 5. If there are no active subscriptions at all, ensure the user pointer is null.
  if (req.user.activeSubscription) {
    await User.findByIdAndUpdate(req.user.id, { activeSubscription: null });
  }

  // 6. Return that no subscription was found.
  return res.status(200).json({
    success: true,
    data: null,
    message: 'No active subscription found.',
  });
});

/**
 * @desc    Get recent subscriptions
 * @route   GET /api/subscriptions/recent
 * @access  Private/Admin
 */
const getRecentSubscriptions = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;

  const subscriptions = await Subscription.find()
    .populate('user', 'name email')
    .populate('plan', 'name price billingCycle')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({
    success: true,
    data: subscriptions,
  });
});

/**
 * @desc    Get all available subscription plans
 * @route   GET /api/subscriptions/plans
 * @access  Private/Admin
 */
const getAllSubscriptionPlans = asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find();
  res.json({
    success: true,
    data: plans,
  });
});

/**
 * @desc    Create a new subscription
 * @route   POST /api/subscriptions
 * @access  Private
 */
const createSubscription = asyncHandler(async (req, res, next) => {
  const { planId, paymentMethod, paymentId, amount, autoRenew } = req.body;

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) {
    return next(new ApiError('Subscription plan not found', 404));
  }

  await Subscription.updateMany(
    { user: req.user.id, status: 'active' },
    { $set: { status: 'cancelled', cancelledAt: new Date() } }
  );

  const now = new Date();
  let expiryDate = new Date(now);

  switch (plan.billingCycle) {
    case 'monthly':
      expiryDate.setMonth(now.getMonth() + 1);
      break;
    case 'yearly':
      expiryDate.setFullYear(now.getFullYear() + 1);
      break;
    default:
      expiryDate.setMonth(now.getMonth() + 1);
  }

  const subscription = await Subscription.create({
    user: req.user.id,
    plan: planId,
    startDate: now,
    endDate: expiryDate,
    status: 'active',
    paymentMethod,
    paymentId,
    amount,
    autoRenew: autoRenew !== undefined ? autoRenew : true,
  });

  await User.findByIdAndUpdate(req.user.id, { activeSubscription: subscription._id });

  await subscription.populate('plan');
  await subscription.populate('user', 'name email');

  res.status(201).json({
    success: true,
    data: subscription,
  });
});

/**
 * @desc    Get subscription by ID
 * @route   GET /api/subscriptions/:id
 * @access  Private/Admin or Subscription Owner
 */
const getSubscriptionById = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id)
    .populate('user', 'name email')
    .populate('plan');

  if (!subscription) {
    return next(new ApiError('Subscription not found', 404));
  }

  if (req.user.role !== 'admin' && subscription.user._id.toString() !== req.user.id) {
    return next(new ApiError('Not authorized to access this subscription', 403));
  }

  res.json({
    success: true,
    data: subscription,
  });
});

/**
 * @desc    Update subscription
 * @route   PUT /api/subscriptions/:id
 * @access  Private/Admin
 */
const updateSubscription = asyncHandler(async (req, res, next) => {
  let subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return next(new ApiError('Subscription not found', 404));
  }

  const { status, endDate, renewalEnabled, paymentMethod, paymentDetails } = req.body;

  if (status) subscription.status = status;
  if (endDate) subscription.endDate = endDate;
  if (renewalEnabled !== undefined) subscription.renewalEnabled = renewalEnabled;
  if (paymentMethod) subscription.paymentMethod = paymentMethod;
  if (paymentDetails) subscription.paymentDetails = paymentDetails;

  await subscription.save();

  await subscription.populate('plan');
  await subscription.populate('user', 'name email');

  res.json({
    success: true,
    data: subscription,
  });
});

/**
 * @desc    Cancel subscription
 * @route   PUT /api/subscriptions/:id/cancel
 * @access  Private/Admin or Subscription Owner
 */
const cancelSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return next(new ApiError('Subscription not found', 404));
  }

  if (req.user.role !== 'admin' && subscription.user.toString() !== req.user.id) {
    return next(new ApiError('Not authorized to cancel this subscription', 403));
  }

  subscription.status = 'cancelled';
  subscription.renewalEnabled = false;
  subscription.cancelledAt = new Date();

  await subscription.save();

  if (subscription.user.toString() === req.user.id) {
    const user = await User.findById(req.user.id);
    if (user.activeSubscription && user.activeSubscription.toString() === req.params.id) {
      user.activeSubscription = null;
      await user.save();
    }
  }

  await subscription.populate('plan');
  await subscription.populate('user', 'name email');

  res.json({
    success: true,
    data: subscription,
    message: 'Subscription cancelled successfully',
  });
});

/**
 * @desc    Renew subscription
 * @route   PUT /api/subscriptions/:id/renew
 * @access  Private/Admin or Subscription Owner
 */
const renewSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id).populate('plan');

  if (!subscription) {
    return next(new ApiError('Subscription not found', 404));
  }

  if (req.user.role !== 'admin' && subscription.user.toString() !== req.user.id) {
    return next(new ApiError('Not authorized to renew this subscription', 403));
  }

  if (subscription.status !== 'expired' && subscription.status !== 'cancelled') {
    return next(new ApiError('Only expired or cancelled subscriptions can be renewed', 400));
  }

  const now = new Date();
  let expiryDate = new Date(now);

  switch (subscription.plan.billingCycle) {
    case 'monthly':
      expiryDate.setMonth(now.getMonth() + 1);
      break;
    case 'quarterly':
      expiryDate.setMonth(now.getMonth() + 3);
      break;
    case 'yearly':
      expiryDate.setFullYear(now.getFullYear() + 1);
      break;
    default:
      expiryDate.setMonth(now.getMonth() + 1);
  }

  subscription.status = 'active';
  subscription.startDate = now;
  subscription.endDate = expiryDate;
  subscription.renewalEnabled = true;
  subscription.cancelledAt = null;

  await subscription.save();

  const user = await User.findById(subscription.user);
  user.activeSubscription = subscription._id;
  await user.save();

  await subscription.populate('user', 'name email');

  res.json({
    success: true,
    data: subscription,
    message: 'Subscription renewed successfully',
  });
});

/**
 * @desc    Delete subscription
 * @route   DELETE /api/subscriptions/:id
 * @access  Private/Admin
 */
const deleteSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return next(new ApiError(`Subscription not found with id of ${req.params.id}`, 404));
  }

  await subscription.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

module.exports = {
  getAllSubscriptions,
  getCurrentSubscription,
  getRecentSubscriptions,
  getAllSubscriptionPlans,
  createSubscription,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  cancelSubscription,
  renewSubscription
};
