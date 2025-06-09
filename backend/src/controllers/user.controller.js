const User = require('../models/user.model');
const { APIError } = require('../middleware/error');
const asyncHandler = require('../utils/async-handler');

/**
 * @desc    Get all users with pagination
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Query
  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Total count
  const total = await User.countDocuments();
  
  res.json({
    success: true,
    data: users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get recent users
 * @route   GET /api/users/recent
 * @access  Private/Admin
 */
exports.getRecentUsers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  
  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(limit);
  
  res.json({
    success: true,
    data: users
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin or Self
 */
exports.getUserById = asyncHandler(async (req, res) => {
  // Check if user is admin or requesting their own profile
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    throw new APIError('Not authorized to access this user', 403);
  }
  
  const user = await User.findById(req.params.id).populate('activeSubscription');
  
  if (!user) {
    throw new APIError('User not found', 404);
  }
  
  res.json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin or Self
 */
exports.updateUser = asyncHandler(async (req, res) => {
  // Check if user is admin or updating their own profile
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    throw new APIError('Not authorized to update this user', 403);
  }
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new APIError('User not found', 404);
  }
  
  // Fields that can be updated
  const { name, email, role } = req.body;
  
  // Update fields
  if (name) user.name = name;
  
  // Only admin can change role
  if (role && req.user.role === 'admin') {
    user.role = role;
  }
  
  // Check if email is already taken by another user
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new APIError('Email is already taken', 400);
    }
    user.email = email;
  }
  
  // Save user
  await user.save();
  
  res.json({
    success: true,
    data: user
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new APIError('User not found', 404);
  }
  
  // Prevent deleting the last admin
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      throw new APIError('Cannot delete the last admin user', 400);
    }
  }
  
  await user.remove();
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * @desc    Get user's download history
 * @route   GET /api/users/:id/downloads
 * @access  Private/Admin or Self
 */
exports.getUserDownloadHistory = asyncHandler(async (req, res) => {
  // Check if user is admin or requesting their own history
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    throw new APIError('Not authorized to access this user\'s download history', 403);
  }
  
  const user = await User.findById(req.params.id)
    .populate({
      path: 'downloadHistory.worksheet',
      select: 'title subject grade subscriptionLevel fileUrl thumbnailUrl'
    });
  
  if (!user) {
    throw new APIError('User not found', 404);
  }
  
  res.json({
    success: true,
    data: user.downloadHistory
  });
});
