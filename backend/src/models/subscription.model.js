const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: [true, 'Subscription plan is required']
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required']
  },
  paymentId: {
    type: String
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for checking if subscription is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.endDate > new Date();
});

// Virtual for days remaining
subscriptionSchema.virtual('daysRemaining').get(function() {
  if (this.status !== 'active') return 0;
  
  const now = new Date();
  const end = new Date(this.endDate);
  
  if (end <= now) return 0;
  
  const diffTime = Math.abs(end - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Method to check if subscription is about to expire (within 7 days)
subscriptionSchema.methods.isAboutToExpire = function() {
  if (this.status !== 'active') return false;
  
  const now = new Date();
  const end = new Date(this.endDate);
  
  if (end <= now) return false;
  
  const diffTime = Math.abs(end - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 7;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
