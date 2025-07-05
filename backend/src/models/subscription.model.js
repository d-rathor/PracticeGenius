const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
  },
  stripeSubscriptionId: {
    type: String,
    unique: true,
    sparse: true, // Required for unique fields that can be null
  },
  stripePriceId: {
    type: String, // Not required, as free plans won't have this
  },
  startDate: {
    type: Date,
  },
  status: {
    type: String,
    required: true,
    enum: [
      'trialing',
      'active',
      'past_due',
      'canceled',
      'incomplete',
      'pending_cancellation',
    ],
    // 'trialing': The subscription is in a trial period.
    // 'active': The subscription is paid and active. Also used for the Free plan.
    // 'past_due': Payment has failed.
    // 'canceled': The subscription has been canceled.
    // 'incomplete': The initial payment attempt failed.
    // 'pending_cancellation': The user has requested to cancel, will be 'canceled' at period end.
  },
  currentPeriodEnd: {
    type: Date, // Not required, as free plans do not have an end date
  },
  cancellation_effective_date: {
    type: Date, // Stores when a pending cancellation will take effect
  },
}, {
  timestamps: true,
});

// Add a virtual to check if the subscription is currently active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' || this.status === 'trialing';
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
