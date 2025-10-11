const ApiError = require('./apiError')

/**
 * Too Many Requests Error class for 429 errors
 * Used when rate limiting is exceeded
 */
class TooManyRequestsError extends ApiError {
  /**
   * Create a new Too Many Requests Error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   */
  constructor(message = 'Too Many Requests', details = {}) {
    super(message, 429, details)
  }
}

module.exports = TooManyRequestsError
