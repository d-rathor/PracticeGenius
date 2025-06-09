const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', auth, updateProfile);

/**
 * @route   PUT /api/auth/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', auth, changePassword);

module.exports = router;
