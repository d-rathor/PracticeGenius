const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and adds user to request object
 */
const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Access denied.'
    });
  }
};

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
  auth,
  authorize
};
