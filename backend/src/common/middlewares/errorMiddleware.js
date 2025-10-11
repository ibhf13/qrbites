const logger = require('@commonUtils/logger')
const {
  ApiError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  formatMongooseErrors,
  logApiError,
} = require('@errors')

/**
 * Not Found middleware - Handles 404 errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundMiddleware = (req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`)
  next(new NotFoundError('Route not found'))
}

/**
 * Centralized Error handler middleware - Processes all errors and sends standardized responses
 * This is the single source of truth for error handling in the application
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandlerMiddleware = (err, req, res, next) => {
  // Create new object properly - Error properties are non-enumerable
  let error = {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    details: err.details,
  }

  // Log the original error for debugging
  logger.error('Error caught by error handler:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  })

  try {
    // Handle Mongoose errors using the new formatMongooseErrors utility
    if (err.name === 'CastError' || err.name === 'ValidationError' || err.code === 11000) {
      error = formatMongooseErrors(err)
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = new UnauthorizedError('Invalid token')
    }

    if (err.name === 'TokenExpiredError') {
      error = new UnauthorizedError('Token expired')
    }

    if (err.name === 'NotBeforeError') {
      error = new UnauthorizedError('Token not yet valid')
    }

    // Multer errors are handled by dedicated multerErrorHandler middleware

    // Handle SyntaxError (malformed JSON)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      error = new BadRequestError('Invalid JSON format')
    }

    // Handle custom ApiError instances
    if (err instanceof ApiError) {
      error = err
    }

    // Determine final status code and message
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal Server Error'
    const details = error.details || {}

    // Log errors appropriately
    if (statusCode >= 500) {
      // For server errors, use the error logging service
      logApiError(err, req)
    } else {
      // For client errors, just log a warning
      logger.warn(`Client error (${statusCode}): ${message}`, {
        details,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      })
    }

    // Send standardized error response
    const response = {
      success: false,
      error: message,
    }

    // Add details if they exist
    if (Object.keys(details).length > 0) {
      response.details = details
    }

    // Add stack trace in development
    if (process.env.NODE_ENV !== 'production') {
      response.stack = err.stack
    }

    res.status(statusCode).json(response)

  } catch (error) {
    next(error)
  }

}

module.exports = {
  notFoundMiddleware,
  errorHandlerMiddleware,
}
