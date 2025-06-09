/**
 * Script to create subscription plans based on the pricing page
 * Run with: node src/scripts/create-subscription-plans.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

// Import the subscription plan model
const SubscriptionPlan = require('../models/subscription-plan.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Sample subscription plans matching the pricing page
const subscriptionPlans = [
  {
    name: 'Basic',
    description: 'Perfect for individual students or parents',
    price: {
      monthly: 12.99,
      yearly: 9.99
    },
    currency: 'USD',
    features: [
      'Access to 100+ basic worksheets',
      'Download up to 10 worksheets per month',
      'Basic progress tracking',
      'Email support'
    ],
    downloadLimit: 10,
    isActive: true
  },
  {
    name: 'Premium',
    description: 'Great for families and homeschooling',
    price: {
      monthly: 24.99,
      yearly: 19.99
    },
    currency: 'USD',
    features: [
      'Access to 500+ premium worksheets',
      'Unlimited downloads',
      'Advanced progress tracking',
      'Priority email support',
      'Customizable worksheets',
      'Up to 3 student profiles'
    ],
    downloadLimit: 0, // Unlimited
    isActive: true,
    isPopular: true
  },
  {
    name: 'Professional',
    description: 'Ideal for teachers and educational institutions',
    price: {
      monthly: 59.99,
      yearly: 49.99
    },
    currency: 'USD',
    features: [
      'Access to all 1,000+ worksheets',
      'Unlimited downloads',
      'Comprehensive progress tracking',
      'Priority phone and email support',
      'Customizable worksheets',
      'Unlimited student profiles',
      'Bulk worksheet generation',
      'Advanced analytics'
    ],
    downloadLimit: 0, // Unlimited
    isActive: true
  }
];

// Function to create subscription plans
const createSubscriptionPlans = async () => {
  try {
    // Clear existing plans
    await SubscriptionPlan.deleteMany({});
    console.log('Existing subscription plans deleted');

    // Create new plans
    const createdPlans = await SubscriptionPlan.create(subscriptionPlans);
    console.log(`${createdPlans.length} subscription plans created:`);
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.price.monthly}/month, $${plan.price.yearly}/year`);
    });

    mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error creating subscription plans:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Run the function
createSubscriptionPlans();
