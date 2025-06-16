/**
 * Error handling middleware
 */
const ApiError = require('../utils/ApiError');

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err }; // Clone the error object
  error.message = err.message; // Ensure message is copied

  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Log all errors in development for easier debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('DEV ERROR \ud83d\udca5:', err);
  }

  // Mongoose Bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(message, 404);
  }

  // Mongoose Duplicate Key (e.g., unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value entered: ${field} '${value}'. Please use another value.`;
    error = new ApiError(message, 400);
  }

  // Mongoose Validation Error (THIS IS THE KEY FIX)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    // If multiple validation errors, join them. Otherwise, use the first.
    const message = messages.length > 1 ? messages.join('. ') : messages[0];
    error = new ApiError(message, 400);
  }
  
  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new ApiError(message, 401);
  }
  if (err.name === 'TokenExpiredError') {
    const message = 'Your session has expired. Please log in again.';
    error = new ApiError(message, 401);
  }


  // Final response logic
  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message,
      stack: err.stack, // Show original stack in dev
      error: err // Show original error in dev
    });
  }

  // Production error response
  // --- BEGIN NEW LOG ---
  if (process.env.NODE_ENV !== 'development') { // Only log this in non-dev (like production)
    console.log('PROD ERROR HANDLER - Error object before isOperational check:', {
      message: error.message,
      statusCode: error.statusCode,
      status: error.status,
      isOperational: error.isOperational,
      name: error.name, // Original error name if available
      originalStack: err.stack // Stack of the original error passed to the handler
    });
  }
  // --- END NEW LOG ---

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message
    });
  }

  // For non-operational errors not caught above, log and send generic message
  console.error('UNHANDLED PROD ERROR \ud83d\udca5', err); // Log the original unhandled error
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
