const User = require('../models/user.model');
const { APIError } = require('../middleware/error');
const asyncHandler = require('../utils/async-handler');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new APIError('User already exists with this email', 400);
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role: 'user' // Default role is user
  });

  // Generate token
  const token = user.generateAuthToken();

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new APIError('Invalid credentials', 401);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new APIError('Invalid credentials', 401);
  }

  // Generate token
  const token = user.generateAuthToken();

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res) => {
  // User is already available in req.user from auth middleware
  const user = await User.findById(req.user.id).populate('activeSubscription');

  res.json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  // Find user
  const user = await User.findById(req.user.id);

  // Check if email is already taken by another user
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new APIError('Email is already taken', 400);
    }
  }

  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;

  // Save user
  await user.save();

  res.json({
    success: true,
    data: user
  });
});

/**
 * @desc    Change user password
 * @route   PUT /api/auth/password
 * @access  Private
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Find user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new APIError('Current password is incorrect', 401);
  }

  // Set new password
  user.password = newPassword;

  // Save user
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});
