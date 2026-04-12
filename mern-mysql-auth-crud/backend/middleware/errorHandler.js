/**
 * Global Error Handling Middleware
 * Catches all unhandled errors and returns structured JSON responses
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // MySQL Duplicate Entry Error
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with this value already exists.';
    if (err.message.includes('email')) {
      message = 'This email is already registered.';
    }
  }

  // MySQL Foreign Key Constraint Error
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referenced record does not exist.';
  }

  // MySQL Connection Error
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    statusCode = 503;
    message = 'Database connection failed. Please try again later.';
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired.';
  }

  // Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = err.message;
  }

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('🔴 Error:', {
      message: err.message,
      code: err.code,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
