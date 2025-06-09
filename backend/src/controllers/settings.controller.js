const Settings = require('../models/settings.model');
const { APIError } = require('../middleware/error');
const asyncHandler = require('../utils/async-handler');

/**
 * @desc    Get subscription settings
 * @route   GET /api/settings/subscription
 * @access  Public
 */
exports.getSubscriptionSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne({ type: 'subscription' });
  
  if (!settings) {
    // Create default subscription settings if not found
    const defaultSettings = await Settings.create({
      type: 'subscription',
      data: {
        plans: [
          {
            name: 'Free',
            price: 0,
            billingCycle: 'monthly',
            features: [
              'Access to free worksheets',
              '3 downloads per day',
              'Basic support'
            ]
          },
          {
            name: 'Essential',
            price: 9.99,
            billingCycle: 'monthly',
            features: [
              'Access to essential worksheets',
              '10 downloads per day',
              'Email support',
              'No ads'
            ]
          },
          {
            name: 'Premium',
            price: 19.99,
            billingCycle: 'monthly',
            features: [
              'Access to all worksheets',
              'Unlimited downloads',
              'Priority support',
              'No ads',
              'Custom worksheet requests'
            ]
          }
        ]
      }
    });
    
    return res.json({
      success: true,
      data: defaultSettings
    });
  }
  
  res.json({
    success: true,
    data: settings
  });
});

/**
 * @desc    Update subscription settings
 * @route   PUT /api/settings/subscription
 * @access  Private/Admin
 */
exports.updateSubscriptionSettings = asyncHandler(async (req, res) => {
  const { data } = req.body;
  
  if (!data) {
    throw new APIError('Settings data is required', 400);
  }
  
  let settings = await Settings.findOne({ type: 'subscription' });
  
  if (!settings) {
    // Create settings if not found
    settings = await Settings.create({
      type: 'subscription',
      data
    });
  } else {
    // Update settings
    settings.data = data;
    await settings.save();
  }
  
  res.json({
    success: true,
    data: settings
  });
});

/**
 * @desc    Get site settings
 * @route   GET /api/settings/site
 * @access  Public
 */
exports.getSiteSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne({ type: 'site' });
  
  if (!settings) {
    // Create default site settings if not found
    const defaultSettings = await Settings.create({
      type: 'site',
      data: {
        siteName: 'Practice Genius',
        tagline: 'Empowering educators with quality worksheets',
        contactEmail: 'support@practicegenius.com',
        socialLinks: {
          facebook: 'https://facebook.com/practicegenius',
          twitter: 'https://twitter.com/practicegenius',
          instagram: 'https://instagram.com/practicegenius'
        },
        footerText: '© 2023 Practice Genius. All rights reserved.'
      }
    });
    
    return res.json({
      success: true,
      data: defaultSettings
    });
  }
  
  res.json({
    success: true,
    data: settings
  });
});

/**
 * @desc    Update site settings
 * @route   PUT /api/settings/site
 * @access  Private/Admin
 */
exports.updateSiteSettings = asyncHandler(async (req, res) => {
  const { data } = req.body;
  
  if (!data) {
    throw new APIError('Settings data is required', 400);
  }
  
  let settings = await Settings.findOne({ type: 'site' });
  
  if (!settings) {
    // Create settings if not found
    settings = await Settings.create({
      type: 'site',
      data
    });
  } else {
    // Update settings
    settings.data = data;
    await settings.save();
  }
  
  res.json({
    success: true,
    data: settings
  });
});

/**
 * @desc    Get settings by type
 * @route   GET /api/settings/:type
 * @access  Public
 */
exports.getSettingsByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  
  const settings = await Settings.findOne({ type });
  
  if (!settings) {
    throw new APIError(`Settings for type '${type}' not found`, 404);
  }
  
  res.json({
    success: true,
    data: settings
  });
});

/**
 * @desc    Update settings by type
 * @route   PUT /api/settings/:type
 * @access  Private/Admin
 */
exports.updateSettingsByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { data } = req.body;
  
  if (!data) {
    throw new APIError('Settings data is required', 400);
  }
  
  let settings = await Settings.findOne({ type });
  
  if (!settings) {
    // Create settings if not found
    settings = await Settings.create({
      type,
      data
    });
  } else {
    // Update settings
    settings.data = data;
    await settings.save();
  }
  
  res.json({
    success: true,
    data: settings
  });
});
