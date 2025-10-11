const ApiError = require('./apiError')

/**
 * Bad Request Error class for 400 errors
 * Used when the request is malformed or contains invalid data
 */
class BadRequestError extends ApiError {
  /**
   * Create a new Bad Request Error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   */
  constructor(message = 'Bad Request', details = {}) {
    super(message, 400, details)
  }
}

module.exports = BadRequestError
