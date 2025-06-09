const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    enum: ['Free', 'Essential', 'Premium'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    monthly: {
      type: Number,
      required: [true, 'Monthly price is required']
    },
    yearly: {
      type: Number,
      required: [true, 'Yearly price is required']
    }
  },
  currency: {
    type: String,
    default: 'USD'
  },
  features: [{
    type: String,
    trim: true
  }],
  downloadLimit: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  isActive: {
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

// Virtual for annual savings
subscriptionPlanSchema.virtual('annualSavings').get(function() {
  if (!this.price || !this.price.monthly || !this.price.yearly) return 0;
  
  const monthlyCost = this.price.monthly * 12;
  const yearlyCost = this.price.yearly;
  
  return monthlyCost - yearlyCost;
});

// Virtual for annual savings percentage
subscriptionPlanSchema.virtual('annualSavingsPercentage').get(function() {
  if (!this.price || !this.price.monthly || !this.price.yearly) return 0;
  
  const monthlyCost = this.price.monthly * 12;
  const yearlyCost = this.price.yearly;
  
  return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

module.exports = SubscriptionPlan;
