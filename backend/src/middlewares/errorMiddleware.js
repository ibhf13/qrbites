const logger = require('@utils/logger')
const { formatMongooseErrors } = require('@utils/errorUtils')
const { logApiError } = require('@services/errorLogService')

/**
 * Not Found middleware - Handles 404 errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundMiddleware = (req, res, next) => {
    logger.warn(`Route not found: ${req.method} ${req.originalUrl}`)

    res.status(404).json({
        success: false,
        error: 'Route not found'
    })
}

/**
 * Error handler middleware - Processes errors and sends appropriate responses
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandlerMiddleware = (err, req, res, next) => {
    let error = err

    // Format mongoose errors
    if (err.name === 'ValidationError' || (err.name === 'MongoServerError' && err.code === 11000)) {
        error = formatMongooseErrors(err)
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = { statusCode: 401, message: 'Invalid token' }
    }

    if (err.name === 'TokenExpiredError') {
        error = { statusCode: 401, message: 'Token expired' }
    }

    // Handle multer errors
    if (err.name === 'MulterError') {
        error = { statusCode: 400, message: err.message }
    }

    // Log the error
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal Server Error'
    const details = error.details || {}

    if (statusCode >= 500) {
        // For server errors, use the error logging service
        logApiError(err, req)
    } else {
        // For client errors, just log a warning
        logger.warn(`Client error (${statusCode}): ${message}`, details)
    }

    // Send response
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(Object.keys(details).length > 0 && { details }),
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    })
}

module.exports = {
    notFoundMiddleware,
    errorHandlerMiddleware
} 