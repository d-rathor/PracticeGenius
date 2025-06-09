require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/user.model');
const Worksheet = require('../models/worksheet.model');
const SubscriptionPlan = require('../models/subscription-plan.model');
const Subscription = require('../models/subscription.model');
const Settings = require('../models/settings.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed data
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await User.deleteMany({});
    await Worksheet.deleteMany({});
    await SubscriptionPlan.deleteMany({});
    await Subscription.deleteMany({});
    await Settings.deleteMany({});
    
    console.log('Existing data cleared');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@practicegenius.com',
      password: adminPassword,
      role: 'admin'
    });
    
    console.log('Admin user created');
    
    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: userPassword,
      role: 'user'
    });
    
    console.log('Regular user created');
    
    // Create subscription plans
    const subscriptionPlans = await SubscriptionPlan.insertMany([
      {
        name: 'Free',
        description: 'Basic access to Practice Genius',
        price: {
          monthly: 0,
          yearly: 0
        },
        features: [
          'Access to free worksheets',
          'Limited downloads (5/month)',
          'Basic support'
        ],
        downloadLimit: 5
      },
      {
        name: 'Essential',
        description: 'Essential access to Practice Genius',
        price: {
          monthly: 9.99,
          yearly: 99.99
        },
        features: [
          'Access to free and essential worksheets',
          'Unlimited downloads',
          'Priority support',
          'Save favorite worksheets'
        ],
        downloadLimit: 0
      },
      {
        name: 'Premium',
        description: 'Premium access to Practice Genius',
        price: {
          monthly: 19.99,
          yearly: 199.99
        },
        features: [
          'Access to all worksheets',
          'Unlimited downloads',
          'Priority support',
          'Save favorite worksheets',
          'Custom worksheet requests',
          'Early access to new worksheets'
        ],
        downloadLimit: 0
      }
    ]);
    
    console.log('Subscription plans created');
    
    // Create a subscription for the regular user
    const userSubscription = await Subscription.create({
      user: regularUser._id,
      plan: subscriptionPlans[1]._id, // Essential plan
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentMethod: 'credit_card',
      paymentId: 'test_payment_id',
      amount: subscriptionPlans[1].price.monthly,
      currency: 'USD',
      autoRenew: true
    });
    
    console.log('User subscription created');
    
    // Update user with subscription
    await User.findByIdAndUpdate(regularUser._id, {
      activeSubscription: userSubscription._id
    });
    
    console.log('User updated with subscription');
    
    // Create worksheets
    const worksheets = await Worksheet.insertMany([
      {
        title: 'Basic Addition Worksheet',
        description: 'Practice basic addition with numbers 1-10',
        subject: 'Math',
        grade: 'Grade 1',
        subscriptionLevel: 'Free',
        keywords: ['math', 'addition', 'elementary'],
        fileUrl: '/uploads/worksheets/basic-addition.pdf',
        thumbnailUrl: '/uploads/thumbnails/basic-addition.jpg',
        createdBy: admin._id,
        downloads: 125
      },
      {
        title: 'Intermediate Multiplication',
        description: 'Practice multiplication with numbers 1-20',
        subject: 'Math',
        grade: 'Grade 3',
        subscriptionLevel: 'Essential',
        keywords: ['math', 'multiplication', 'elementary'],
        fileUrl: '/uploads/worksheets/intermediate-multiplication.pdf',
        thumbnailUrl: '/uploads/thumbnails/intermediate-multiplication.jpg',
        createdBy: admin._id,
        downloads: 87
      },
      {
        title: 'Advanced Fractions',
        description: 'Practice advanced fraction operations',
        subject: 'Math',
        grade: 'Grade 5',
        subscriptionLevel: 'Premium',
        keywords: ['math', 'fractions', 'advanced'],
        fileUrl: '/uploads/worksheets/advanced-fractions.pdf',
        thumbnailUrl: '/uploads/thumbnails/advanced-fractions.jpg',
        createdBy: admin._id,
        downloads: 42
      }
    ]);
    
    console.log('Worksheets created');
    
    // Create settings
    await Settings.insertMany([
      {
        type: 'subscription',
        data: {
          plans: [
            {
              name: 'Free',
              price: {
                monthly: 0,
                yearly: 0
              },
              features: [
                'Access to free worksheets',
                'Limited downloads (5/month)',
                'Basic support'
              ]
            },
            {
              name: 'Essential',
              price: {
                monthly: 9.99,
                yearly: 99.99
              },
              features: [
                'Access to free and essential worksheets',
                'Unlimited downloads',
                'Priority support',
                'Save favorite worksheets'
              ]
            },
            {
              name: 'Premium',
              price: {
                monthly: 19.99,
                yearly: 199.99
              },
              features: [
                'Access to all worksheets',
                'Unlimited downloads',
                'Priority support',
                'Save favorite worksheets',
                'Custom worksheet requests',
                'Early access to new worksheets'
              ]
            }
          ]
        },
        updatedBy: admin._id
      },
      {
        type: 'site',
        data: {
          siteName: 'Practice Genius',
          contactEmail: 'contact@practicegenius.com',
          socialLinks: {
            facebook: 'https://facebook.com/practicegenius',
            twitter: 'https://twitter.com/practicegenius',
            instagram: 'https://instagram.com/practicegenius'
          },
          footerText: '© 2023 Practice Genius. All rights reserved.'
        },
        updatedBy: admin._id
      }
    ]);
    
    console.log('Settings created');
    
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
