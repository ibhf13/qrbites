const logger = require('@utils/logger')

/**
 * Logs error details to the console or a remote service
 * @param {Error} error - The error to log
 * @param {Object} context - Additional context about the error
 */
const logError = (error, context = {}) => {
    const logData = {
        timestamp: new Date().toISOString(),
        name: error.name,
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode || 500,
        ...context
    }

    logger.error('Application error', logData)
}

/**
 * Logs API request failures
 * @param {Error} error - The error that occurred
 * @param {Object} req - Express request object
 */
const logApiError = (error, req) => {
    const context = {
        path: req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.method !== 'GET' ? req.body : undefined,
        ip: req.ip,
        user: req.user ? req.user._id : 'unauthenticated'
    }

    logError(error, context)
}

/**
 * Logs database operation failures
 * @param {Error} error - The error that occurred
 * @param {string} operation - The database operation that failed
 * @param {Object} query - The query that was executed
 */
const logDatabaseError = (error, operation, query) => {
    const context = {
        operation,
        query
    }

    logError(error, context)
}

module.exports = {
    logError,
    logApiError,
    logDatabaseError
} 