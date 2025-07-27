const Subscription = require('../models/subscription.model.js');
const SubscriptionPlan = require('../models/subscription-plan.model.js');
const User = require('../models/user.model.js');
const ApiError = require('../utils/ApiError.js');
const asyncHandler = require('../utils/async-handler.js');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Re-usable function to create a checkout session
const createNewCheckoutSession = async (user, plan) => {
  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString(),
      },
    });
    stripeCustomerId = customer.id;
    await User.findByIdAndUpdate(user._id, { stripeCustomerId });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [
      {
        price: plan.stripePriceId.monthly, // Assuming monthly
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/dashboard/subscription?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/dashboard/subscription?payment_cancelled=true`,
    metadata: {
      userId: user._id.toString(),
      planId: plan._id.toString(),
    },
  });

  return session;
};

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

const getCurrentSubscription = asyncHandler(async (req, res, next) => {
  let activeSub = null;

  if (req.user.activeSubscription) {
    activeSub = await Subscription.findById(req.user.activeSubscription).populate('plan');
    if (activeSub && activeSub.status !== 'active' && activeSub.status !== 'pending_cancellation') {
      activeSub = null;
    }
  }

  if (!activeSub) {
    activeSub = await Subscription.findOne({
      user: req.user.id,
      status: { $in: ['active', 'pending_cancellation'] },
    }).sort({ createdAt: -1 }).populate('plan');
  }

  if (activeSub) {
    if (!req.user.activeSubscription || req.user.activeSubscription.toString() !== activeSub._id.toString()) {
      await User.findByIdAndUpdate(req.user.id, { activeSubscription: activeSub._id });
    }

    const needsDateBackfill = !activeSub.startDate || !activeSub.currentPeriodEnd;
    if (needsDateBackfill && activeSub.stripeSubscriptionId) {
      try {
        const stripeSub = await stripe.subscriptions.retrieve(activeSub.stripeSubscriptionId);
        if (!activeSub.startDate && stripeSub.start_date) {
          activeSub.startDate = new Date(stripeSub.start_date * 1000);
        }
        if (!activeSub.currentPeriodEnd && stripeSub.current_period_end) {
          activeSub.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
        }
        if (stripeSub.status !== activeSub.status) {
          activeSub.status = stripeSub.status;
        }
        if (stripeSub.cancel_at_period_end && activeSub.status === 'active') {
          activeSub.status = 'pending_cancellation';
          activeSub.cancellation_effective_date = new Date(stripeSub.cancel_at * 1000);
        }
        await activeSub.save();
      } catch (error) {
        console.error(`Error backfilling subscription data from Stripe for sub ${activeSub._id}:`, error);
      }
    }
    return res.status(200).json({ success: true, data: activeSub });
  }

  if (req.user.activeSubscription) {
    await User.findByIdAndUpdate(req.user.id, { activeSubscription: null });
  }

  return res.status(200).json({
    success: true,
    data: null,
    message: 'No active subscription found.',
  });
});

const getRecentSubscriptions = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  const subscriptions = await Subscription.find()
    .populate('user', 'name email')
    .populate('plan', 'name price billingCycle')
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json({ success: true, data: subscriptions });
});

const getAllSubscriptionPlans = asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find();
  res.json({ success: true, data: plans });
});

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
  res.status(201).json({ success: true, data: subscription });
});

const getSubscriptionById = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id).populate('user', 'name email').populate('plan');
  if (!subscription) {
    return next(new ApiError('Subscription not found', 404));
  }
  if (req.user.role !== 'admin' && subscription.user._id.toString() !== req.user.id) {
    return next(new ApiError('Not authorized to access this subscription', 403));
  }
  res.json({ success: true, data: subscription });
});

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
  res.json({ success: true, data: subscription });
});

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
  res.json({ success: true, data: subscription, message: 'Subscription renewed successfully' });
});

const deleteSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);
  if (!subscription) {
    return next(new ApiError(`Subscription not found with id of ${req.params.id}`, 404));
  }
  await subscription.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) {
    throw new ApiError('Plan not found', 404);
  }
  if (!plan.stripePriceId || !plan.stripePriceId.monthly) {
    throw new ApiError(`Plan '${plan.name}' has no monthly payment option.`, 500);
  }

  const user = await User.findById(userId);
  const session = await createNewCheckoutSession(user, plan);

  res.json({ sessionId: session.id });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    throw new ApiError('Session ID is required', 400);
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });

    // Check if the payment was successful
    if (session.payment_status !== 'paid') {
      throw new ApiError('Payment was not successful. Please try again.', 400);
    }

    // Check if a subscription was actually created
    if (!session.subscription) {
      throw new ApiError('Subscription could not be created. Please contact support.', 500);
    }

    const userId = session.metadata.userId;
    const planId = session.metadata.planId;
    const user = await User.findById(userId);
    const plan = await SubscriptionPlan.findById(planId);

    if (!user || !plan) {
      throw new ApiError('User or Plan not found from session metadata', 404);
    }

    const existingSub = await Subscription.findOne({ stripeSubscriptionId: session.subscription.id });
    if (existingSub) {
      return res.json({ success: true, message: 'Subscription already verified.' });
    }

    const stripeSub = session.subscription;

    const newSubscription = await Subscription.create({
      user: userId,
      plan: planId,
      stripeSubscriptionId: stripeSub.id,
      stripeCustomerId: stripeSub.customer,
      status: stripeSub.status,
      startDate: new Date(stripeSub.start_date * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      renewalEnabled: !stripeSub.cancel_at_period_end,
    });

    await User.findByIdAndUpdate(userId, { activeSubscription: newSubscription._id });
    res.json({ success: true, message: 'Payment verified and subscription activated.' });
  } catch (error) {
    console.error('Error verifying Stripe session:', error);
    // Use the error message from ApiError if available, otherwise provide a generic one
    const message = error instanceof ApiError ? error.message : 'Failed to verify payment session.';
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    // Ensure we don't re-throw, which would be caught by asyncHandler and cause a generic 500.
    // Instead, we send the response directly.
    res.status(statusCode).json({ success: false, message });
  }
});

const switchPlan = asyncHandler(async (req, res, next) => {
  const { planId } = req.body;
  const userId = req.user.id;

  const newPlan = await SubscriptionPlan.findById(planId);
  if (!newPlan) {
    throw new ApiError('Plan not found', 404);
  }
  if (!newPlan.stripePriceId || !newPlan.stripePriceId.monthly) {
    throw new ApiError(`Plan '${newPlan.name}' has no monthly payment option.`, 500);
  }

  const user = await User.findById(userId);
  let activeSubscription = await Subscription.findOne({
    user: userId,
    status: { $in: ['active', 'pending_cancellation'] },
  }).populate('plan');

  // If the user has no active subscription, treat it as a new subscription.
  if (!activeSubscription) {
    const session = await createNewCheckoutSession(user, newPlan);
    return res.json({ sessionId: session.id });
  }

  // If the user is trying to switch to the same plan, do nothing.
  if (activeSubscription.plan._id.toString() === newPlan._id.toString()) {
    return res.json({ success: true, message: 'You are already on this plan.' });
  }

  // Handle switching from a non-Stripe (e.g., old free) plan to a paid one
  if (!activeSubscription.stripeSubscriptionId) {
    const session = await createNewCheckoutSession(user, newPlan);
    return res.json({ sessionId: session.id });
  }

  // User has an existing Stripe subscription, so we switch them.
  try {
    const stripeSubscription = await stripe.subscriptions.retrieve(activeSubscription.stripeSubscriptionId);

    if (newPlan.name === 'Free') {
      if (activeSubscription.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(activeSubscription.stripeSubscriptionId);
      }
      activeSubscription.plan = newPlan._id;
      activeSubscription.stripeSubscriptionId = null;
      activeSubscription.status = 'active';
      await activeSubscription.save();
    } else {
      await stripe.subscriptions.update(activeSubscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
        items: [{
          id: stripeSubscription.items.data[0].id,
          price: newPlan.stripePriceId.monthly,
        }],
        proration_behavior: 'create_prorations',
      });
      activeSubscription.plan = newPlan._id;
      activeSubscription.status = 'active';
      await activeSubscription.save();
    }

    // Refetch the latest subscription data to send back to the client
    const updatedSubscription = await Subscription.findById(activeSubscription._id).populate('plan');

    res.json({
      success: true,
      data: updatedSubscription,
      message: 'Your subscription plan has been successfully updated.',
    });
  } catch (error) {
    console.error('Error switching plan:', error);
    return next(new ApiError('Could not switch your plan due to a provider error.', 500));
  }
});

const cancelActiveSubscription = asyncHandler(async (req, res, next) => {
  const sub = await Subscription.findOne({
    user: req.user.id,
    status: 'active',
  });

  if (!sub) {
    return next(new ApiError('No active subscription found to cancel.', 404));
  }

  // If there is no stripe ID, it's a local/free plan. Just cancel it locally.
  if (!sub.stripeSubscriptionId) {
    sub.status = 'canceled';
    await sub.save();
    await sub.populate('plan');
    return res.json({
      success: true,
      data: sub,
      message: 'Subscription cancelled successfully.',
    });
  }

  try {
    // For Stripe subs, set them to cancel at the end of the billing period.
    const stripeSub = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Now, update our local record with the definitive data from Stripe
    sub.status = 'pending_cancellation';
    sub.cancellation_effective_date = new Date(stripeSub.cancel_at * 1000);
    await sub.save();
    await sub.populate('plan');

    res.json({
      success: true,
      data: sub,
      message: 'Subscription scheduled for cancellation at the end of the billing period.',
    });
  } catch (error) {
    console.error(`Stripe API cancellation failed for subscription ${sub._id}:`, error);
    return next(new ApiError('Could not cancel subscription with our payment provider.', 500));
  }
});

module.exports = {
  getAllSubscriptions,
  getCurrentSubscription,
  getRecentSubscriptions,
  getAllSubscriptionPlans,
  createSubscription,
  getSubscriptionById,
  updateSubscription,
  renewSubscription,
  deleteSubscription,
  createCheckoutSession,
  verifyPayment,
  switchPlan,
  cancelActiveSubscription,
};
