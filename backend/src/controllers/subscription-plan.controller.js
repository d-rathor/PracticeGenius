const SubscriptionPlan = require('../models/subscription-plan.model');
const { APIError } = require('../middleware/error');
const asyncHandler = require('../utils/async-handler');

/**
 * @desc    Get all subscription plans
 * @route   GET /api/subscription-plans
 * @access  Public
 */
exports.getAllSubscriptionPlans = asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find().sort({ price: 1 });
  
  res.json({
    success: true,
    data: plans
  });
});

/**
 * @desc    Create a new subscription plan
 * @route   POST /api/subscription-plans
 * @access  Private/Admin
 */
exports.createSubscriptionPlan = asyncHandler(async (req, res) => {
  const { name, description, price, features, isActive, downloadLimit } = req.body;
  
  // Check if plan with same name already exists
  const existingPlan = await SubscriptionPlan.findOne({ name });
  if (existingPlan) {
    throw new APIError(`Subscription plan with name '${name}' already exists`, 400);
  }
  
  // Create plan
  const plan = await SubscriptionPlan.create({
    name,
    description,
    price: {
      monthly: price?.monthly || 0,
      yearly: price?.yearly || 0
    },
    features: features || [],
    isActive: isActive !== undefined ? isActive : true,
    downloadLimit: downloadLimit || 0
  });
  
  res.status(201).json({
    success: true,
    data: plan
  });
});

/**
 * @desc    Get subscription plan by ID
 * @route   GET /api/subscription-plans/:id
 * @access  Public
 */
exports.getSubscriptionPlanById = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findById(req.params.id);
  
  if (!plan) {
    throw new APIError('Subscription plan not found', 404);
  }
  
  res.json({
    success: true,
    data: plan
  });
});

/**
 * @desc    Update subscription plan
 * @route   PUT /api/subscription-plans/:id
 * @access  Private/Admin
 */
exports.updateSubscriptionPlan = asyncHandler(async (req, res) => {
  let plan = await SubscriptionPlan.findById(req.params.id);
  
  if (!plan) {
    throw new APIError('Subscription plan not found', 404);
  }
  
  const { name, description, price, features, isActive, downloadLimit } = req.body;
  
  // Check if another plan with the same name exists
  if (name && name !== plan.name) {
    const existingPlan = await SubscriptionPlan.findOne({ name });
    if (existingPlan) {
      throw new APIError(`Another subscription plan with name '${name}' already exists`, 400);
    }
  }
  
  // Update fields
  if (name) plan.name = name;
  if (description) plan.description = description;
  if (price) {
    if (price.monthly !== undefined) plan.price.monthly = price.monthly;
    if (price.yearly !== undefined) plan.price.yearly = price.yearly;
  }
  if (features) plan.features = features;
  if (isActive !== undefined) plan.isActive = isActive;
  if (downloadLimit !== undefined) plan.downloadLimit = downloadLimit;
  
  // Save plan
  await plan.save();
  
  res.json({
    success: true,
    data: plan
  });
});

/**
 * @desc    Delete subscription plan
 * @route   DELETE /api/subscription-plans/:id
 * @access  Private/Admin
 */
exports.deleteSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findById(req.params.id);
  
  if (!plan) {
    throw new APIError('Subscription plan not found', 404);
  }
  
  // Check if plan is being used by any subscriptions
  const Subscription = require('../models/subscription.model');
  const subscriptionCount = await Subscription.countDocuments({ plan: req.params.id });
  
  if (subscriptionCount > 0) {
    throw new APIError('Cannot delete plan that is being used by active subscriptions', 400);
  }
  
  await plan.remove();
  
  res.json({
    success: true,
    message: 'Subscription plan deleted successfully'
  });
});
