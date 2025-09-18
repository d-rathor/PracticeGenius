const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/admin.controller');
const { generateWorksheet } = require('../controllers/worksheet.generator.controller');
const { generateWorksheetDsl } = require('../controllers/worksheet.dsl.controller');
const { protect: auth, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard stats
 * @access  Private/Admin
 */
router.get('/stats', auth, authorize(['admin']), getStats);

/**
 * @route   POST /api/admin/worksheet-generator/generate
 * @desc    Generate a new worksheet (legacy approach)
 * @access  Private/Admin
 */
router.post('/worksheet-generator/generate', auth, authorize(['admin']), generateWorksheet);

/**
 * @route   POST /api/admin/worksheet-generator/generate-dsl
 * @desc    Generate a new worksheet using DSL approach
 * @access  Private/Admin
 */
router.post('/worksheet-generator/generate-dsl', auth, authorize(['admin']), generateWorksheetDsl);

module.exports = router;
