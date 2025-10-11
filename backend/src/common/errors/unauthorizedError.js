const ApiError = require('./apiError')

/**
 * Unauthorized Error class for 401 errors
 * Used when authentication is required but not provided or invalid
 */
class UnauthorizedError extends ApiError {
  /**
   * Create a new Unauthorized Error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   */
  constructor(message = 'Unauthorized', details = {}) {
    super(message, 401, details)
  }
}

module.exports = UnauthorizedError
