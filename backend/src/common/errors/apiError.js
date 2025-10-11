/**
 * Base API Error class that extends the native Error class
 * Provides a standardized way to create errors with status codes
 */
class ApiError extends Error {
  /**
   * Create a new API Error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} details - Additional error details
   * @param {boolean} isOperational - Whether this is an operational error (default: true)
   */
  constructor(message, statusCode = 500, details = {}, isOperational = true) {
    super(message)

    this.name = this.constructor.name
    this.statusCode = statusCode
    this.details = details
    this.isOperational = isOperational

    // Capture stack trace for debugging
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = ApiError
