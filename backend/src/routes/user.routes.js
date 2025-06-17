const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getUserDownloadHistory,
  getRecentUsers,
  getMyDownloadedWorksheets // Added for user's unique downloaded worksheets list
} = require('../controllers/user.controller');
const { auth, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination
 * @access  Private/Admin
 */
router.get('/', auth, authorize(['admin']), getAllUsers);

/**
 * @route   GET /api/users/recent
 * @desc    Get recent users
 * @access  Private/Admin
 */
router.get('/recent', auth, authorize(['admin']), getRecentUsers);

/**
 * @route   GET /api/users/me/downloaded-worksheets
 * @desc    Get logged-in user's uniquely downloaded worksheets
 * @access  Private (Self)
 */
router.get('/me/downloaded-worksheets', auth, getMyDownloadedWorksheets);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin or Self
 */
router.get('/:id', auth, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private/Admin or Self
 */
router.put('/:id', auth, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/:id', auth, authorize(['admin']), deleteUser);

/**
 * @route   GET /api/users/:id/downloads
 * @desc    Get user's download history
 * @access  Private/Admin or Self
 */
router.get('/:id/downloads', auth, getUserDownloadHistory);

module.exports = router;
