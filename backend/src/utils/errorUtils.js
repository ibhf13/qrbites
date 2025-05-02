const logger = require('@utils/logger')

/**
 * Custom error with status code and details
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {Error} Custom error object
 */
const createError = (message, statusCode = 500, details = {}) => {
    const error = new Error(message)
    error.statusCode = statusCode
    error.details = details
    return error
}

/**
 * Create a 400 Bad Request error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Error} Bad request error
 */
const badRequest = (message = 'Bad Request', details = {}) => {
    return createError(message, 400, details)
}

/**
 * Create a 401 Unauthorized error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Error} Unauthorized error
 */
const unauthorized = (message = 'Unauthorized', details = {}) => {
    return createError(message, 401, details)
}

/**
 * Create a 403 Forbidden error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Error} Forbidden error
 */
const forbidden = (message = 'Forbidden', details = {}) => {
    return createError(message, 403, details)
}

/**
 * Create a 404 Not Found error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Error} Not found error
 */
const notFound = (message = 'Not Found', details = {}) => {
    return createError(message, 404, details)
}

/**
 * Create a 409 Conflict error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Error} Conflict error
 */
const conflict = (message = 'Conflict', details = {}) => {
    return createError(message, 409, details)
}

/**
 * Create a 422 Unprocessable Entity error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Error} Validation error
 */
const validation = (message = 'Validation Error', details = {}) => {
    return createError(message, 422, details)
}

/**
 * Create a 500 Internal Server Error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Error} Server error
 */
const serverError = (message = 'Internal Server Error', details = {}) => {
    return createError(message, 500, details)
}

/**
 * Create a 429 Too Many Requests error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Error} Too many requests error
 */
const tooManyRequests = (message = 'Too Many Requests', details = {}) => {
    return createError(message, 429, details)
}

/**
 * Format Mongoose validation errors
 * @param {Error} err - Mongoose validation error
 * @returns {Object} Formatted error object
 */
const formatMongooseErrors = (err) => {
    logger.debug('Formatting Mongoose error', err)

    if (err.name === 'ValidationError') {
        const errors = {}

        Object.keys(err.errors).forEach(key => {
            errors[key] = err.errors[key].message
        })

        return validation('Validation error', errors)
    }

    if (err.name === 'MongoServerError' && err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        const value = err.keyValue[field]
        const message = `${field} '${value}' already exists`

        return conflict(message, { field, value })
    }

    return err
}

/**
 * Handle async function errors
 * @param {Function} fn - Async function to handle
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

module.exports = {
    createError,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    validation,
    serverError,
    tooManyRequests,
    formatMongooseErrors,
    asyncHandler
} 