/**
 * Script to seed subscription plans directly in the database
 * Run with: node src/scripts/seed-subscription-plans.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionPlan = require('../models/subscription-plan.model');

// Connect to MongoDB using the connection string from the environment
// or use the one that's currently working with your server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://devendrarathor:AUhkNDOr3164jhct@practicegenius.leeblag.mongodb.net/?retryWrites=true&w=majority&appName=PracticeGenius';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    seedSubscriptionPlans();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Subscription plans data based on the allowed enum values in the model
const subscriptionPlans = [
  {
    name: 'Free', // Changed from 'Basic' to match enum
    description: 'Perfect for individual students or parents',
    price: {
      monthly: 0.00, // Free plan
      yearly: 0.00
    },
    currency: 'USD',
    features: [
      'Access to limited worksheets',
      'Download up to 3 worksheets per month',
      'Basic progress tracking'
    ],
    downloadLimit: 3,
    isActive: true
  },
  {
    name: 'Essential', // Changed from 'Basic' to match enum
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
    name: 'Premium', // This matches the enum
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
  }
];

// Function to seed subscription plans
async function seedSubscriptionPlans() {
  try {
    // Check if plans already exist
    const existingPlans = await SubscriptionPlan.find();
    
    if (existingPlans.length > 0) {
      console.log(`Found ${existingPlans.length} existing subscription plans.`);
      console.log('Deleting existing plans...');
      await SubscriptionPlan.deleteMany({});
      console.log('Existing plans deleted.');
    }

    // Create new plans
    const createdPlans = await SubscriptionPlan.create(subscriptionPlans);
    
    console.log(`Successfully created ${createdPlans.length} subscription plans:`);
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.price.monthly}/month, $${plan.price.yearly}/year`);
    });

    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error seeding subscription plans:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}
