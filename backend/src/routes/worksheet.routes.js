const express = require('express');
const router = express.Router();
const { 
  getAllWorksheets,
  getWorksheetById,
  createWorksheet,
  updateWorksheet,
  deleteWorksheet,
  downloadWorksheet,
  getRecentWorksheets
} = require('../controllers/worksheet.controller');
const { protect: auth, authorize } = require('../middleware/auth');
// const oldLocalUpload = require('../middleware/upload'); // Keep if needed for thumbnails later
const b2WorksheetUpload = require('../config/fileUpload'); // New B2 uploader

/**
 * @route   GET /api/worksheets
 * @desc    Get all worksheets with filtering and pagination
 * @access  Public (with subscription level filtering)
 */
router.get('/', getAllWorksheets);

/**
 * @route   GET /api/worksheets/recent
 * @desc    Get recent worksheets
 * @access  Public
 */
router.get('/recent', getRecentWorksheets);

/**
 * @route   POST /api/worksheets
 * @desc    Create a new worksheet
 * @access  Private/Admin
 */
router.post('/', 
  auth, 
  authorize('admin'), 
  b2WorksheetUpload.single('worksheetFile'), // Use B2 uploader for the main worksheet file
  createWorksheet
);

/**
 * @route   GET /api/worksheets/:id
 * @desc    Get worksheet by ID
 * @access  Public (with subscription check)
 */
router.get('/:id', getWorksheetById);

/**
 * @route   PUT /api/worksheets/:id
 * @desc    Update worksheet
 * @access  Private/Admin
 */
router.put('/:id', 
  auth, 
  authorize('admin'), 
  b2WorksheetUpload.single('worksheetFile'), // Use B2 uploader for the main worksheet file
  updateWorksheet
);

/**
 * @route   DELETE /api/worksheets/:id
 * @desc    Delete worksheet
 * @access  Private/Admin
 */
router.delete('/:id', auth, authorize(['admin']), deleteWorksheet);

/**
 * @route   GET /api/worksheets/:id/download
 * @desc    Download worksheet and track download
 * @access  Private (with subscription check)
 */
router.get('/:id/download', auth, downloadWorksheet);

module.exports = router;
