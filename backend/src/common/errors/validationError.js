const ApiError = require('./apiError')

/**
 * Validation Error class for 422 errors
 * Used when request data fails validation
 */
class ValidationError extends ApiError {
  /**
   * Create a new Validation Error
   * @param {string} message - Error message
   * @param {Object} details - Validation error details
   */
  constructor(message = 'Validation Error', details = {}) {
    super(message, 422, details)
  }
}

module.exports = ValidationError
