const SubscriptionPlan = require('../models/subscription-plan.model');
const { APIError } = require('../middleware/error');
const asyncHandler = require('../utils/async-handler');

/**
 * @desc    Get all subscription plans
 * @route   GET /api/subscription-plans
 * @access  Public
 */
const getAllSubscriptionPlans = asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ 'price.monthly': 1 }).lean();
  res.status(200).json({ success: true, data: plans });
});

/**
 * @desc    Create a new subscription plan
 * @route   POST /api/subscription-plans
 * @access  Private/Admin
 */
const createSubscriptionPlan = asyncHandler(async (req, res) => {
  const { name, description, price, features, isActive, downloadLimit } = req.body;
  const existingPlan = await SubscriptionPlan.findOne({ name });
  if (existingPlan) {
    throw new APIError(`Subscription plan with name '${name}' already exists`, 400);
  }
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
const getSubscriptionPlanById = asyncHandler(async (req, res) => {
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
const updateSubscriptionPlan = asyncHandler(async (req, res) => {
  let plan = await SubscriptionPlan.findById(req.params.id);
  if (!plan) {
    throw new APIError('Subscription plan not found', 404);
  }
  const { name, description, price, features, isActive, downloadLimit } = req.body;
  if (name && name !== plan.name) {
    const existingPlan = await SubscriptionPlan.findOne({ name });
    if (existingPlan) {
      throw new APIError(`Another subscription plan with name '${name}' already exists`, 400);
    }
  }
  if (name) plan.name = name;
  if (description) plan.description = description;
  if (price) {
    if (price.monthly !== undefined) plan.price.monthly = price.monthly;
    if (price.yearly !== undefined) plan.price.yearly = price.yearly;
  }
  if (features) plan.features = features;
  if (isActive !== undefined) plan.isActive = isActive;
  if (downloadLimit !== undefined) plan.downloadLimit = downloadLimit;
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
const deleteSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findById(req.params.id);
  if (!plan) {
    throw new APIError('Subscription plan not found', 404);
  }
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

module.exports = {
  getAllSubscriptionPlans,
  createSubscriptionPlan,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
};