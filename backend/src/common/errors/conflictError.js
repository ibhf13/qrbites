const ApiError = require('./apiError')

/**
 * Conflict Error class for 409 errors
 * Used when there's a conflict with the current state of the resource
 */
class ConflictError extends ApiError {
  /**
   * Create a new Conflict Error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   */
  constructor(message = 'Conflict', details = {}) {
    super(message, 409, details)
  }
}

module.exports = ConflictError
