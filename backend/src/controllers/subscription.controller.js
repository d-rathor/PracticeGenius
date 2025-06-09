const Subscription = require('../models/subscription.model');
const SubscriptionPlan = require('../models/subscription-plan.model');
const User = require('../models/user.model');
const { APIError } = require('../middleware/error');
const asyncHandler = require('../utils/async-handler');

/**
 * @desc    Get all subscriptions with pagination
 * @route   GET /api/subscriptions
 * @access  Private/Admin
 */
exports.getAllSubscriptions = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Query
  const subscriptions = await Subscription.find()
    .populate('user', 'name email')
    .populate('plan', 'name price billingCycle')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Total count
  const total = await Subscription.countDocuments();
  
  res.json({
    success: true,
    data: subscriptions,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get current user's subscription
 * @route   GET /api/subscriptions/current
 * @access  Private
 */
exports.getCurrentSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'activeSubscription',
    populate: {
      path: 'plan',
      model: 'SubscriptionPlan'
    }
  });
  
  if (!user.activeSubscription) {
    return res.json({
      success: true,
      data: null
    });
  }
  
  res.json({
    success: true,
    data: user.activeSubscription
  });
});

/**
 * @desc    Get recent subscriptions
 * @route   GET /api/subscriptions/recent
 * @access  Private/Admin
 */
exports.getRecentSubscriptions = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  
  const subscriptions = await Subscription.find()
    .populate('user', 'name email')
    .populate('plan', 'name price billingCycle')
    .sort({ createdAt: -1 })
    .limit(limit);
  
  res.json({
    success: true,
    data: subscriptions
  });
});

/**
 * @desc    Create a new subscription
 * @route   POST /api/subscriptions
 * @access  Private
 */
exports.createSubscription = asyncHandler(async (req, res) => {
  const { planId, paymentMethod, paymentDetails } = req.body;
  
  // Check if plan exists
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) {
    throw new APIError('Subscription plan not found', 404);
  }
  
  // Check if user already has an active subscription
  const user = await User.findById(req.user.id).populate('activeSubscription');
  if (user.activeSubscription && user.activeSubscription.status === 'active') {
    throw new APIError('You already have an active subscription', 400);
  }
  
  // Calculate expiry date based on billing cycle
  const now = new Date();
  let expiryDate = new Date(now);
  
  switch (plan.billingCycle) {
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
  
  // Create subscription
  const subscription = await Subscription.create({
    user: req.user.id,
    plan: planId,
    startDate: now,
    endDate: expiryDate,
    status: 'active',
    paymentMethod,
    paymentDetails,
    renewalEnabled: true
  });
  
  // Update user's active subscription
  user.activeSubscription = subscription._id;
  await user.save();
  
  // Populate subscription details
  await subscription.populate('plan');
  await subscription.populate('user', 'name email');
  
  res.status(201).json({
    success: true,
    data: subscription
  });
});

/**
 * @desc    Get subscription by ID
 * @route   GET /api/subscriptions/:id
 * @access  Private/Admin or Subscription Owner
 */
exports.getSubscriptionById = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id)
    .populate('user', 'name email')
    .populate('plan');
  
  if (!subscription) {
    throw new APIError('Subscription not found', 404);
  }
  
  // Check if user is admin or subscription owner
  if (req.user.role !== 'admin' && subscription.user._id.toString() !== req.user.id) {
    throw new APIError('Not authorized to access this subscription', 403);
  }
  
  res.json({
    success: true,
    data: subscription
  });
});

/**
 * @desc    Update subscription
 * @route   PUT /api/subscriptions/:id
 * @access  Private/Admin
 */
exports.updateSubscription = asyncHandler(async (req, res) => {
  let subscription = await Subscription.findById(req.params.id);
  
  if (!subscription) {
    throw new APIError('Subscription not found', 404);
  }
  
  // Fields that can be updated
  const { status, endDate, renewalEnabled, paymentMethod, paymentDetails } = req.body;
  
  // Update fields
  if (status) subscription.status = status;
  if (endDate) subscription.endDate = endDate;
  if (renewalEnabled !== undefined) subscription.renewalEnabled = renewalEnabled;
  if (paymentMethod) subscription.paymentMethod = paymentMethod;
  if (paymentDetails) subscription.paymentDetails = paymentDetails;
  
  // Save subscription
  await subscription.save();
  
  // Populate subscription details
  await subscription.populate('plan');
  await subscription.populate('user', 'name email');
  
  res.json({
    success: true,
    data: subscription
  });
});

/**
 * @desc    Cancel subscription
 * @route   PUT /api/subscriptions/:id/cancel
 * @access  Private/Admin or Subscription Owner
 */
exports.cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);
  
  if (!subscription) {
    throw new APIError('Subscription not found', 404);
  }
  
  // Check if user is admin or subscription owner
  if (req.user.role !== 'admin' && subscription.user.toString() !== req.user.id) {
    throw new APIError('Not authorized to cancel this subscription', 403);
  }
  
  // Update subscription
  subscription.status = 'cancelled';
  subscription.renewalEnabled = false;
  subscription.cancelledAt = Date.now();
  
  // Save subscription
  await subscription.save();
  
  // If user is cancelling their own subscription, update user record
  if (subscription.user.toString() === req.user.id) {
    const user = await User.findById(req.user.id);
    if (user.activeSubscription && user.activeSubscription.toString() === req.params.id) {
      user.activeSubscription = null;
      await user.save();
    }
  }
  
  // Populate subscription details
  await subscription.populate('plan');
  await subscription.populate('user', 'name email');
  
  res.json({
    success: true,
    data: subscription,
    message: 'Subscription cancelled successfully'
  });
});

/**
 * @desc    Renew subscription
 * @route   PUT /api/subscriptions/:id/renew
 * @access  Private/Admin or Subscription Owner
 */
exports.renewSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id)
    .populate('plan');
  
  if (!subscription) {
    throw new APIError('Subscription not found', 404);
  }
  
  // Check if user is admin or subscription owner
  if (req.user.role !== 'admin' && subscription.user.toString() !== req.user.id) {
    throw new APIError('Not authorized to renew this subscription', 403);
  }
  
  // Check if subscription is expired or cancelled
  if (subscription.status !== 'expired' && subscription.status !== 'cancelled') {
    throw new APIError('Only expired or cancelled subscriptions can be renewed', 400);
  }
  
  // Calculate new expiry date based on billing cycle
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
  
  // Update subscription
  subscription.status = 'active';
  subscription.startDate = now;
  subscription.endDate = expiryDate;
  subscription.renewalEnabled = true;
  subscription.cancelledAt = null;
  
  // Save subscription
  await subscription.save();
  
  // Update user's active subscription
  const user = await User.findById(subscription.user);
  user.activeSubscription = subscription._id;
  await user.save();
  
  // Populate subscription details
  await subscription.populate('user', 'name email');
  
  res.json({
    success: true,
    data: subscription,
    message: 'Subscription renewed successfully'
  });
});
