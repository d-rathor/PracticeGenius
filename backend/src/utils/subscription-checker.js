require('dotenv').config();
const mongoose = require('mongoose');
const Subscription = require('../models/subscription.model');
const User = require('../models/user.model');
const { MONGODB_URI } = require('../config/env');

/**
 * Script to check for expired subscriptions and update their status
 * This can be run as a scheduled job (e.g., daily via cron)
 */
const checkExpiredSubscriptions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for subscription check');

    // Get current date
    const now = new Date();

    // Find expired subscriptions that are still marked as active
    const expiredSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { $lt: now }
    });

    console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);

    // Update each expired subscription
    for (const subscription of expiredSubscriptions) {
      console.log(`Processing subscription ${subscription._id} for user ${subscription.user}`);

      // Update subscription status
      subscription.status = 'expired';
      await subscription.save();

      // If renewal is enabled, create a new subscription
      if (subscription.renewalEnabled) {
        console.log(`Renewing subscription for user ${subscription.user}`);
        
        // Calculate new expiry date based on billing cycle
        const newStartDate = new Date();
        let newEndDate = new Date(newStartDate);
        
        // Get plan details
        const plan = await mongoose.model('SubscriptionPlan').findById(subscription.plan);
        
        if (plan) {
          switch (plan.billingCycle) {
            case 'monthly':
              newEndDate.setMonth(newStartDate.getMonth() + 1);
              break;
            case 'quarterly':
              newEndDate.setMonth(newStartDate.getMonth() + 3);
              break;
            case 'yearly':
              newEndDate.setFullYear(newStartDate.getFullYear() + 1);
              break;
            default:
              newEndDate.setMonth(newStartDate.getMonth() + 1);
          }
          
          // Create new subscription
          const newSubscription = await Subscription.create({
            user: subscription.user,
            plan: subscription.plan,
            startDate: newStartDate,
            endDate: newEndDate,
            status: 'active',
            paymentMethod: subscription.paymentMethod,
            paymentDetails: subscription.paymentDetails,
            renewalEnabled: subscription.renewalEnabled
          });
          
          // Update user's active subscription
          await User.findByIdAndUpdate(subscription.user, {
            activeSubscription: newSubscription._id
          });
          
          console.log(`Created new subscription ${newSubscription._id} for user ${subscription.user}`);
        } else {
          console.error(`Plan ${subscription.plan} not found for renewal`);
        }
      } else {
        // If renewal is not enabled, remove active subscription from user
        await User.findByIdAndUpdate(subscription.user, {
          $unset: { activeSubscription: 1 }
        });
        
        console.log(`Removed active subscription from user ${subscription.user}`);
      }
    }

    console.log('Subscription check completed successfully');
  } catch (error) {
    console.error('Error checking subscriptions:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the check if this file is executed directly
if (require.main === module) {
  checkExpiredSubscriptions()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
}

module.exports = checkExpiredSubscriptions;
