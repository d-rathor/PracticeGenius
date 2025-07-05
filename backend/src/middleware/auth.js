const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/async-handler');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const { JWT_SECRET } = require('../config/env');

/**
 * Authentication middleware to protect routes
 * Verifies JWT token, fetches the latest user data from the DB, and adds it to the request object
 */
const auth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError('Access denied. No token provided.', 401));
  }

  const token = authHeader.split(' ')[1];

  // jwt.verify will throw an error if the token is invalid, which asyncHandler will catch.
  const decoded = jwt.verify(token, JWT_SECRET);

  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    return next(new ApiError('User for this token no longer exists. Access denied.', 401));
  }

  req.user = user;
  next();
});

/**
 * Role-based authorization middleware
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

module.exports = {
  protect: auth,
  authorize,
};