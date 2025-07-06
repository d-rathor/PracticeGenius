const Subscription = require('../models/subscription.model.js');
const SubscriptionPlan = require('../models/subscription-plan.model.js');
const User = require('../models/user.model.js');
const ApiError = require('../utils/ApiError.js');
const asyncHandler = require('../utils/async-handler.js');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

  // 1. Try to find an active subscription in the DB via the user's activeSubscription field
  if (req.user.activeSubscription) {
    activeSub = await Subscription.findById(req.user.activeSubscription).populate('plan');
    // Invalidate if status is no longer active or pending cancellation
    if (activeSub && activeSub.status !== 'active' && activeSub.status !== 'pending_cancellation') {
      activeSub = null; 
    }
  }

  // 2. If not found on user object, try to find the latest one for that user in the DB
  if (!activeSub) {
    activeSub = await Subscription.findOne({
      user: req.user.id,
      status: { $in: ['active', 'pending_cancellation'] },
    }).sort({ createdAt: -1 }).populate('plan');
  }

  // 3. If we found a subscription, ensure its data is up-to-date
  if (activeSub) {
    // Sync user's active subscription pointer to the correct one
    if (!req.user.activeSubscription || req.user.activeSubscription.toString() !== activeSub._id.toString()) {
      await User.findByIdAndUpdate(req.user.id, { activeSubscription: activeSub._id });
    }

    // 4. Backfill missing dates from Stripe to fix data inconsistencies
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
        // Also update status if it's out of sync as a safety measure
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
        // Do not fail the entire request, just return the data we have from the DB
      }
    }
    
    return res.status(200).json({ success: true, data: activeSub });
  }

  // 5. If no active subscription is found anywhere, ensure user record is clean
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

  res.json({
    success: true,
    data: subscriptions,
  });
});

const getAllSubscriptionPlans = asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find();
  res.json({
    success: true,
    data: plans,
  });
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

  res.status(201).json({
    success: true,
    data: subscription,
  });
});

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

const cancelSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return next(new ApiError('Subscription not found', 404));
  }

  if (req.user.role !== 'admin' && subscription.user.toString() !== req.user.id) {
    return next(new ApiError('Not authorized to cancel this subscription', 403));
  }

  // If the subscription is managed by Stripe, cancel it via their API
  if (subscription.stripeSubscriptionId) {
    try {
      const stripeSub = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update our local record to reflect pending cancellation
      subscription.status = 'pending_cancellation';
      subscription.renewalEnabled = false;
      subscription.cancelledAt = new Date(); // Record when the cancellation was requested
      subscription.cancellation_effective_date = new Date(stripeSub.cancel_at * 1000);

      await subscription.save();

      // Repopulate for the response
      await subscription.populate('plan');
      await subscription.populate('user', 'name email');

      return res.json({
        success: true,
        data: subscription,
        message: 'Subscription scheduled for cancellation at the end of the billing period.',
      });
    } catch (error) {
      console.error(`Stripe API cancellation failed for subscription ${subscription._id}:`, error);
      return next(new ApiError('Failed to cancel subscription with our payment provider.', 500));
    }
  } else {
    // Fallback for legacy/non-Stripe subscriptions
    subscription.status = 'cancelled';
    subscription.renewalEnabled = false;
    subscription.cancelledAt = new Date();

    await subscription.save();

    // For immediate cancellations, detach the subscription from the user
    if (req.user.activeSubscription && req.user.activeSubscription.toString() === subscription._id.toString()) {
      await User.findByIdAndUpdate(req.user.id, { activeSubscription: null });
    }

    await subscription.populate('plan');
    await subscription.populate('user', 'name email');

    return res.json({
      success: true,
      data: subscription,
      message: 'Subscription cancelled successfully.',
    });
  }
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

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) {
    throw new ApiError('Plan not found', 404);
  }
  if (
    !plan.stripePriceId ||
    typeof plan.stripePriceId !== 'object' ||
    !plan.stripePriceId.monthly
  ) {
    console.error(
      'Invalid stripePriceId format for plan:',
      plan.name,
      'Received:',
      plan.stripePriceId
    );
    throw new ApiError(
      `Plan '${plan.name}' has an invalid payment configuration. Please contact support.`,
      500
    );
  }

  const user = await User.findById(userId);
  let stripeCustomerId = user.stripeCustomerId;

  // Check for an existing active subscription to perform an upgrade/downgrade
  const existingSubscription = await Subscription.findOne({
    user: userId,
    status: { $in: ['active', 'pending_cancellation'] },
  });

  if (existingSubscription && existingSubscription.stripeSubscriptionId) {
    console.log(`[UPGRADE] Found active subscription ${existingSubscription.stripeSubscriptionId} for user ${userId}. Upgrading plan.`);
    const stripeSubscription = await stripe.subscriptions.retrieve(existingSubscription.stripeSubscriptionId);

    const updatedStripeSubscription = await stripe.subscriptions.update(existingSubscription.stripeSubscriptionId, {
      cancel_at_period_end: false, // Ensure it doesn't cancel if it was pending cancellation
      items: [{
        id: stripeSubscription.items.data[0].id, // Get the ID of the first subscription item
        price: plan.stripePriceId.monthly, // The new price ID
      }],
      proration_behavior: 'create_prorations', // This will handle billing adjustments
    });

    // --- FIX: Update local DB immediately to prevent race condition ---
    const newStripePriceId = updatedStripeSubscription.items.data[0].price.id;
    const newPlan = await SubscriptionPlan.findOne({
      $or: [{ 'stripePriceId.monthly': newStripePriceId }, { 'stripePriceId.yearly': newStripePriceId }],
    });

    if (newPlan) {
      const updatePayload = {
        plan: newPlan._id,
        stripePriceId: newStripePriceId,
        status: updatedStripeSubscription.status,
      };

      if (updatedStripeSubscription.start_date) {
        updatePayload.startDate = new Date(updatedStripeSubscription.start_date * 1000);
      }
      if (updatedStripeSubscription.current_period_end) {
        updatePayload.currentPeriodEnd = new Date(updatedStripeSubscription.current_period_end * 1000);
      }

      await Subscription.findOneAndUpdate(
        { user: userId, stripeSubscriptionId: existingSubscription.stripeSubscriptionId },
        updatePayload
      );
      console.log(`[UPGRADE_SUCCESS] Local DB updated for user ${userId} to plan ${newPlan.name}.`);
    } else {
      console.error(`[UPGRADE_ERROR] Could not find local plan for new Stripe Price ID: ${newStripePriceId}. Webhook will need to sync.`);
    }
    // --- END FIX ---

    return res.json({
      success: true,
      data: { upgraded: true },
      message: 'Subscription updated successfully.',
    });
  }

  // If no active subscription, proceed to create a new one via Checkout
  console.log(`[NEW_SUB] No active subscription found for user ${userId}. Creating new checkout session.`);
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user._id.toString() },
    });
    stripeCustomerId = customer.id;
    await User.findByIdAndUpdate(userId, { stripeCustomerId });
  }

  const priceId = plan.stripePriceId.monthly;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: stripeCustomerId,
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    metadata: {
      userId: userId.toString(),
      planId: planId.toString(),
    },
    success_url: `${process.env.CLIENT_URL}/dashboard/subscription?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/dashboard/subscription`,
  });

  res.json({ success: true, data: { sessionId: session.id } });
});

const cancelActiveSubscription = asyncHandler(async (req, res, next) => {
  const { id: userId } = req.user;

  const subscription = await Subscription.findOne({
    user: userId,
    status: 'active',
  });

  if (!subscription || !subscription.stripeSubscriptionId) {
    return next(new ApiError('No active subscription found to cancel.', 404));
  }

  try {
    // Tell Stripe to cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Retrieve the subscription again to ensure we have the latest state
    const updatedStripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    // The `cancel_at` field is guaranteed to be populated after the update.
    // We use it to set the date for our local record.
    if (!updatedStripeSubscription.cancel_at) {
      console.error('Stripe subscription is missing cancel_at field after cancellation request.', updatedStripeSubscription);
      return next(new ApiError('Could not retrieve cancellation date from payment provider.', 500));
    }

    subscription.status = 'pending_cancellation';
    subscription.currentPeriodEnd = new Date(updatedStripeSubscription.cancel_at * 1000);
    await subscription.save();

    const populatedSubscription = await Subscription.findById(subscription._id).populate('plan');

    res.status(200).json({
      success: true,
      data: populatedSubscription,
      message: 'Your subscription is now scheduled to be cancelled at the end of the current billing period.',
    });
  } catch (error) {
    console.error('Stripe cancellation error:', error);
    if (error.code === 'resource_missing') {
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      await subscription.save();
      return next(new ApiError('Subscription not found with our payment provider. It has been marked as cancelled.', 404));
    }
    return next(new ApiError('Failed to cancel subscription with payment provider.', 500));
  }
});

const verifyPayment = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return next(new ApiError('Session ID is required', 400));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid' || !session.subscription) {
      return next(new ApiError('Payment not successful or subscription not found.', 400));
    }

    const { userId, planId } = session.metadata;
    const stripeSubscription = session.subscription;

    if (!userId || !planId) {
      return next(new ApiError('Session metadata is missing required information.', 400));
    }

    // Idempotency check: See if we've already processed this subscription
    const existingSubscription = await Subscription.findOne({ stripeSubscriptionId: stripeSubscription.id });
    if (existingSubscription) {
      const populatedSubscription = await Subscription.findById(existingSubscription._id).populate('plan');
      return res.json({
        success: true,
        data: populatedSubscription,
        message: 'Payment already verified.',
      });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return next(new ApiError('Plan not found.', 404));
    }

    // Deactivate any old subscriptions for this user
    await Subscription.updateMany(
      { user: userId, status: { $in: ['active', 'pending_cancellation'] } },
      { $set: { status: 'cancelled', cancelledAt: new Date() } }
    );

    // Create the new subscription
    const newSubscription = await Subscription.create({
      user: userId,
      plan: planId,
      stripeSubscriptionId: stripeSubscription.id,
      status: 'active',
      startDate: new Date(stripeSubscription.created * 1000),
      endDate: new Date(stripeSubscription.current_period_end * 1000),
      autoRenew: true,
    });

    // Update the user's active subscription
    await User.findByIdAndUpdate(userId, { activeSubscription: newSubscription._id });

    const populatedSubscription = await Subscription.findById(newSubscription._id).populate('plan');

    res.json({
      success: true,
      data: populatedSubscription,
      message: 'Payment verified and subscription updated.',
    });
  } catch (error) {
    console.error('Error verifying payment session:', error);
    next(new ApiError('Failed to verify payment session.', 500));
  }
});





module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  cancelSubscription,
  renewSubscription,
  getRecentSubscriptions,
  getCurrentSubscription,
  getAllSubscriptionPlans,
  createCheckoutSession,
  verifyPayment,
  cancelActiveSubscription,
};
