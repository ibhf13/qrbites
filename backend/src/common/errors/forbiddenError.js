const ApiError = require('./apiError')

/**
 * Forbidden Error class for 403 errors
 * Used when user is authenticated but doesn't have permission to access the resource
 */
class ForbiddenError extends ApiError {
  /**
   * Create a new Forbidden Error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   */
  constructor(message = 'Forbidden', details = {}) {
    super(message, 403, details)
  }
}

module.exports = ForbiddenError
