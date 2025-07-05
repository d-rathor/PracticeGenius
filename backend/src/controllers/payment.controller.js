const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user.model');
const Subscription = require('../models/subscription.model');
const SubscriptionPlan = require('../models/subscription-plan.model');

// @desc    Create a Stripe checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  const { planId, billingCycle = 'monthly' } = req.body;
  const userId = req.user.id;

  if (!planId) {
    return res.status(400).json({ success: false, message: 'Plan ID is required' });
  }

  try {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

        // Handle the 'Free' plan as a special case, bypassing Stripe
    if (plan.name === 'Free') {
      try {
        const existingSubscription = await Subscription.findOne({ user: userId });

        // If user has an active, non-free subscription, they must cancel it first.
        if (existingSubscription && existingSubscription.status === 'active' && existingSubscription.stripeSubscriptionId && !existingSubscription.stripeSubscriptionId.startsWith('free-')) {
          return res.status(400).json({
            success: false,
            message: 'Please cancel your current paid subscription before switching to the Free plan.',
          });
        }

        // If user already has an active free plan, do nothing.
        if (existingSubscription && existingSubscription.status === 'active' && existingSubscription.stripeSubscriptionId && existingSubscription.stripeSubscriptionId.startsWith('free-')) {
            return res.json({ success: true, message: 'You are already on the Free plan.', isFreeTier: true });
        }

        // If user has an inactive subscription, remove it before creating the new free one.
        if (existingSubscription) {
          await Subscription.findByIdAndDelete(existingSubscription._id);
        }

        const newSubscription = await Subscription.create({
          user: userId,
          plan: plan._id,
          stripeSubscriptionId: `free-${userId}-${Date.now()}`, // Create a unique ID
          stripePriceId: 'free-plan', // Placeholder
          status: 'active',
          currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 100)), // Set expiration far in the future
        });

        console.log(`Successfully created free subscription for user ${userId}`);
        return res.json({ success: true, subscription: newSubscription, isFreeTier: true });

      } catch (error) {
        console.error('Error creating free subscription:', error);
        return res.status(500).json({ success: false, message: 'Server error while creating free subscription' });
      }
    }

    const priceId = plan.stripePriceId[billingCycle];
    if (!priceId) {
      return res.status(400).json({
        success: false,
        message: `Price for ${billingCycle} billing cycle not found for this plan.`
      });
    }

    const user = await User.findById(userId).select('+stripeCustomerId');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { mongoUserId: user._id.toString() },
      });
      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard/subscription?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/subscription?payment_canceled=true`,
      metadata: {
        userId: user._id.toString(),
        planId: plan._id.toString(),
      },
    });

    res.json({ success: true, sessionId: session.id });

  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    res.status(500).json({ success: false, message: 'Server error while creating checkout session' });
  }
};

// @desc    Handle Stripe webhooks to fulfill orders
// @route   POST /api/payments/webhook
// @access  Public (accessible only by Stripe)
const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.sendStatus(400);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.mode === 'subscription') {
        await createSubscriptionFromSession(session);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await updateSubscriptionStatus(subscription);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Helper function to create a new subscription from a checkout session
const createSubscriptionFromSession = async (session) => {
  const { userId } = session.metadata;
  const stripeSubscriptionId = session.subscription;

  try {
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const stripePriceId = subscription.items.data[0].price.id;

    console.log(`[DB_LOOKUP] Searching for plan with Stripe Price ID: ${stripePriceId}`);
    const plan = await SubscriptionPlan.findOne({ $or: [{ 'stripePriceId.monthly': stripePriceId }, { 'stripePriceId.yearly': stripePriceId }] });
    console.log(`[DB_LOOKUP] Found plan: ${plan ? plan.name : 'NULL'}`);

    if (!plan) {
      console.error(`[WEBHOOK] Plan with Stripe Price ID ${stripePriceId} not found.`);
      return;
    }

        // Use findOneAndUpdate with upsert to handle both new subscriptions and plan changes (e.g., Free -> Paid).
    // This ensures a single, authoritative subscription record per user.
    await Subscription.findOneAndUpdate(
      { user: userId }, // Find the subscription by the user's ID
      {
        // Set or update the subscription fields
        plan: plan._id,
        stripeSubscriptionId,
        stripePriceId,
        status: subscription.status,
        startDate: new Date(subscription.start_date * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      {
        new: true,    // Return the modified document
        upsert: true, // Create a new document if one doesn't exist for the user
      }
    );

    console.log(`[WEBHOOK] Successfully created subscription for user ${userId}`);
  } catch (error) {
    console.error(`[WEBHOOK] Error creating subscription:`, error);
  }
};

// Helper function to update an existing subscription's status
const updateSubscriptionStatus = async (stripeSubscription) => {
  const { id, status, current_period_end } = stripeSubscription;

  try {
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: id },
      {
        status,
        endDate: new Date(current_period_end * 1000),
      },
      { new: true }
    );
    if (updatedSubscription) {
        console.log(`[WEBHOOK] Successfully updated subscription ${id} to status ${status}`);
    }
  } catch (error) {
    console.error(`[WEBHOOK] Error updating subscription status:`, error);
  }
};

const verifyPaymentSession = async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user.id;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Session ID is required' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Ensure the session belongs to the logged-in user
    if (session.metadata.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // If payment was successful, ensure subscription is created/updated
    if (session.payment_status === 'paid') {
      console.log(`[VERIFY] Payment successful for session ${sessionId}. Triggering subscription update.`);
      await createSubscriptionFromSession(session);
    }

    // Fetch the latest subscription details for the user
    const updatedSubscription = await Subscription.findOne({ user: userId }).populate('plan');
    console.log('[VERIFY] Sending updated subscription to frontend:', JSON.stringify(updatedSubscription, null, 2));

    res.json({ success: true, subscription: updatedSubscription });

  } catch (error) {
    console.error('Error verifying payment session:', error);
    res.status(500).json({ success: false, message: 'Server error while verifying session' });
  }
};

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
  verifyPaymentSession,
};