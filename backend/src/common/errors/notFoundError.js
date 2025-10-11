const ApiError = require('./apiError')

/**
 * Not Found Error class for 404 errors
 * Used when a requested resource is not found
 */
class NotFoundError extends ApiError {
  /**
   * Create a new Not Found Error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   */
  constructor(message = 'Not Found', details = {}) {
    super(message, 404, details)
  }
}

module.exports = NotFoundError
