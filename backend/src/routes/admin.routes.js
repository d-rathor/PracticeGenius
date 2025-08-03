const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/admin.controller');
const { generateWorksheet } = require('../controllers/worksheet.generator.controller');
const { protect: auth, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard stats
 * @access  Private/Admin
 */
router.get('/stats', auth, authorize(['admin']), getStats);

/**
 * @route   POST /api/admin/worksheet-generator/generate
 * @desc    Generate a new worksheet
 * @access  Private/Admin
 */
router.post('/worksheet-generator/generate', auth, authorize(['admin']), generateWorksheet);

module.exports = router;
