const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/admin.controller');
const { protect: auth, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard stats
 * @access  Private/Admin
 */
router.get('/stats', auth, authorize(['admin']), getStats);

module.exports = router;
