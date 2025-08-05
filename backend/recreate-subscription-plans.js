const mongoose = require('mongoose');
require('dotenv').config();

// Import the subscription plan model
const SubscriptionPlan = require('./src/models/subscription-plan.model');

async function recreateSubscriptionPlans() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing subscription plans
    await SubscriptionPlan.deleteMany({});
    console.log('Cleared existing subscription plans');

    // Create subscription plans matching the model schema
    const subscriptionPlans = [
      {
        name: 'Free',
        description: 'Perfect for getting started with basic worksheets',
        price: 0,
        currency: 'USD',
        stripePriceId: {
          monthly: 'price_free_monthly', // Placeholder for free plan
          yearly: 'price_free_yearly'    // Placeholder for free plan
        },
        features: [
          'Access to 20+ basic worksheets',
          'Download up to 3 worksheets per month',
          'Basic worksheet formats',
          'Community support'
        ],
        downloadLimit: 3,
        isActive: true
      },
      {
        name: 'Essential',
        description: 'Great for regular users and small families',
        price: 1199, // Monthly price
        currency: 'USD',
        stripePriceId: {
          monthly: 'price_1RgNQQIT4S5DntREO70n1ZNC', // Replace with actual Stripe price IDs
          yearly: 'price_1RglgtIT4S5DntRE1iHlBv3j'    // Replace with actual Stripe price IDs
        },
        features: [
          'Access to 200+ worksheets',
          'Download up to 25 worksheets per month',
          'AI-generated custom worksheets',
          'Multiple subjects and grades',
          'Email support'
        ],
        downloadLimit: 25,
        isActive: true
      },
      {
        name: 'Premium',
        description: 'Perfect for teachers, homeschoolers, and large families',
        price: 1499, // Monthly price
        currency: 'USD',
        stripePriceId: {
          monthly: 'price_1RhgZ1IT4S5DntREWfYk4Xpm', // Replace with actual Stripe price IDs
          yearly: 'price_1RglgQIT4S5DntRE95kddmwg'    // Replace with actual Stripe price IDs
        },
        features: [
          'Unlimited access to all worksheets',
          'Unlimited downloads',
          'AI-generated custom worksheets with images',
          'Answer keys included',
          'All subjects and grades',
          'Priority support',
          'Bulk worksheet generation',
          'Advanced customization options'
        ],
        downloadLimit: 0, // 0 means unlimited
        isActive: true
      }
    ];

    // Create the subscription plans
    const createdPlans = await SubscriptionPlan.create(subscriptionPlans);
    
    console.log('✅ Subscription plans recreated successfully!');
    console.log(`Created ${createdPlans.length} subscription plans:`);
    
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.price}/month (${plan.features.length} features)`);
    });

  } catch (error) {
    console.error('❌ Error recreating subscription plans:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

recreateSubscriptionPlans();
