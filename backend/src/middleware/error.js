/**
 * Error handling middleware
 */
const ApiError = require('../utils/ApiError');

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err }; // Clone
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';
  if (err.isOperational !== undefined) {
    error.isOperational = err.isOperational;
  }

  // Mongoose/JWT specific handlers (these re-assign 'error' with a new ApiError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(message, 404);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value entered: ${field} '${value}'. Please use another value.`;
    error = new ApiError(message, 400);
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const message = messages.length > 1 ? messages.join('. ') : messages[0];
    error = new ApiError(message, 400);
  }
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new ApiError(message, 401);
  }
  if (err.name === 'TokenExpiredError') {
    const message = 'Your session has expired. Please log in again.';
    error = new ApiError(message, 401);
  }
  if (process.env.NODE_ENV === 'development') {
    console.error('DEV ERROR 💥:', err);
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message,
      stack: err.stack,
      errorDetails: { name: err.name, message: err.message, statusCode: err.statusCode } // Simplified
    });
  }

  // Production error response
  if (error.isOperational) {
    if (res.headersSent) {
      return next(error); // Pass to default Express handler if we can't send
    }
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message
    });
  }

  // If not operational, or if it's an unhandled case in production
  console.error('UNHANDLED PROD ERROR DETAILS 💥', err); // Log the original error object for full details

  if (res.headersSent) {
    return next(err); // Pass to default Express handler
  }
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went very wrong on our end. Please try again later.'
  });
};

/**
 * Not found middleware for undefined routes
 */
const notFound = (req, res, next) => {
  const error = new ApiError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

// Export both ApiError and APIError to maintain backward compatibility
module.exports = {
  ApiError,
  APIError: ApiError, // Add alias for backward compatibility
  errorHandler,
  notFound
};
