const express = require('express');
const router = express.Router();
const { 
  getSubscriptionSettings,
  updateSubscriptionSettings,
  getSiteSettings,
  updateSiteSettings,
  getSettingsByType,
  updateSettingsByType
} = require('../controllers/settings.controller');
const { protect: auth, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/settings/subscription
 * @desc    Get subscription settings
 * @access  Public
 */
router.get('/subscription', getSubscriptionSettings);

/**
 * @route   PUT /api/settings/subscription
 * @desc    Update subscription settings
 * @access  Private/Admin
 */
router.put('/subscription', auth, authorize(['admin']), updateSubscriptionSettings);

/**
 * @route   GET /api/settings/site
 * @desc    Get site settings
 * @access  Public
 */
router.get('/site', getSiteSettings);

/**
 * @route   PUT /api/settings/site
 * @desc    Update site settings
 * @access  Private/Admin
 */
router.put('/site', auth, authorize(['admin']), updateSiteSettings);

/**
 * @route   GET /api/settings/:type
 * @desc    Get settings by type
 * @access  Public
 */
router.get('/:type', getSettingsByType);

/**
 * @route   PUT /api/settings/:type
 * @desc    Update settings by type
 * @access  Private/Admin
 */
router.put('/:type', auth, authorize(['admin']), updateSettingsByType);

module.exports = router;
