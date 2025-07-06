const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user.model');
const Subscription = require('../models/subscription.model');
const SubscriptionPlan = require('../models/subscription-plan.model');

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
    const updatePayload = {
      plan: plan._id,
      stripeSubscriptionId,
      stripePriceId,
      status: subscription.status,
    };

    if (subscription.start_date) {
      updatePayload.startDate = new Date(subscription.start_date * 1000);
    }
    if (subscription.current_period_end) {
      updatePayload.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    }

    await Subscription.findOneAndUpdate(
      { user: userId }, // Find the subscription by the user's ID
      updatePayload,
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
    const updatePayload = { status };
    if (current_period_end) {
      updatePayload.endDate = new Date(current_period_end * 1000);
    }

    const updatedSubscription = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: id },
      updatePayload,
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

  handleStripeWebhook,
  verifyPaymentSession,
};