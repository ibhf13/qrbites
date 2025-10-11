const ApiError = require('./apiError')

/**
 * Server Error class for 500 errors
 * Used for internal server errors
 */
class ServerError extends ApiError {
  /**
   * Create a new Server Error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   */
  constructor(message = 'Internal Server Error', details = {}) {
    super(message, 500, details)
  }
}

module.exports = ServerError
