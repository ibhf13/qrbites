const logger = require('@commonUtils/logger')

// Import custom error classes
const ApiError = require('./apiError')
const BadRequestError = require('./badRequestError')
const UnauthorizedError = require('./unauthorizedError')
const ForbiddenError = require('./forbiddenError')
const NotFoundError = require('./notFoundError')
const ConflictError = require('./conflictError')
const ValidationError = require('./validationError')
const ServerError = require('./serverError')
const TooManyRequestsError = require('./tooManyRequestsError')

/**
 * Create a custom error with status code and details
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {ApiError} Custom error object
 */
const createError = (message, statusCode = 500, details = {}) => {
  return new ApiError(message, statusCode, details)
}

/**
 * Create a 400 Bad Request error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {BadRequestError} Bad request error
 */
const badRequest = (message = 'Bad Request', details = {}) => {
  return new BadRequestError(message, details)
}

/**
 * Create a 401 Unauthorized error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {UnauthorizedError} Unauthorized error
 */
const unauthorized = (message = 'Unauthorized', details = {}) => {
  return new UnauthorizedError(message, details)
}

/**
 * Create a 403 Forbidden error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {ForbiddenError} Forbidden error
 */
const forbidden = (message = 'Forbidden', details = {}) => {
  return new ForbiddenError(message, details)
}

/**
 * Create a 404 Not Found error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {NotFoundError} Not found error
 */
const notFound = (message = 'Not Found', details = {}) => {
  return new NotFoundError(message, details)
}

/**
 * Create a 409 Conflict error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {ConflictError} Conflict error
 */
const conflict = (message = 'Conflict', details = {}) => {
  return new ConflictError(message, details)
}

/**
 * Create a 422 Unprocessable Entity error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {ValidationError} Validation error
 */
const validation = (message = 'Validation Error', details = {}) => {
  return new ValidationError(message, details)
}

/**
 * Create a 500 Internal Server Error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {ServerError} Server error
 */
const serverError = (message = 'Internal Server Error', details = {}) => {
  return new ServerError(message, details)
}

/**
 * Create a 429 Too Many Requests error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {TooManyRequestsError} Too many requests error
 */
const tooManyRequests = (message = 'Too Many Requests', details = {}) => {
  return new TooManyRequestsError(message, details)
}

/**
 * Safely check if a property exists on an object and is not inherited from prototype
 * @param {Object} obj - Object to check
 * @param {string} key - Property key to check
 * @returns {boolean} True if property exists and is own property
 */
const hasOwnProperty = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

/**
 * Safely get object keys that are not inherited from prototype
 * @param {Object} obj - Object to get keys from
 * @returns {string[]} Array of own property keys
 */
const getOwnKeys = obj => {
  if (!obj || typeof obj !== 'object') {
    return []
  }
  return Object.keys(obj).filter(key => hasOwnProperty(obj, key))
}

/**
 * Safely get property value from object without prototype pollution
 * @param {Object} obj - Object to get property from
 * @param {string} key - Property key
 * @returns {*} Property value or undefined
 */
const safeGetProperty = (obj, key) => {
  if (!obj || typeof obj !== 'object' || !hasOwnProperty(obj, key)) {
    return undefined
  }
  // Use Object.getOwnPropertyDescriptor to safely access the property
  const descriptor = Object.getOwnPropertyDescriptor(obj, key)
  return descriptor ? descriptor.value : undefined
}

/**
 * Format Mongoose validation errors
 * @param {Error} err - Mongoose validation error
 * @returns {ValidationError|ConflictError|Error} Formatted error object
 */
const formatMongooseErrors = err => {
  logger.debug('Formatting Mongoose error', err)

  if (err.name === 'ValidationError') {
    const errors = {}

    // Safely iterate over own properties only
    const errorKeys = getOwnKeys(err.errors)
    errorKeys.forEach(key => {
      const errorObj = safeGetProperty(err.errors, key)
      if (errorObj && typeof errorObj === 'object' && hasOwnProperty(errorObj, 'message')) {
        const message = safeGetProperty(errorObj, 'message')
        if (message) {
          // Use Object.defineProperty to safely set the property
          Object.defineProperty(errors, key, {
            value: message,
            writable: true,
            enumerable: true,
            configurable: true,
          })
        }
      }
    })

    return new ValidationError('Validation error', errors)
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    // Safely get the first own property from keyValue
    const keyValueKeys = getOwnKeys(err.keyValue)
    if (keyValueKeys.length > 0) {
      const field = keyValueKeys[0]
      const value = safeGetProperty(err.keyValue, field)
      if (value !== undefined) {
        const message = `${field} '${value}' already exists`

        return new ConflictError(message, { field, value })
      }
    }
  }

  return err
}

/**
 * Handle async function errors
 * @param {Function} fn - Async function to handle
 * @returns {Function} Express middleware
 */
const asyncHandler = fn => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Standard error messages for consistent API responses
 */
const errorMessages = {
  /**
   * Generate standardized not found message
   * @param {string} resource - Resource type (e.g., 'Restaurant', 'Menu', 'User')
   * @param {string} [id] - Optional ID to include in message
   * @returns {string} Standardized error message
   */
  notFound: (resource, id = null) => {
    return id ? `${resource} with id ${id} not found` : `${resource} not found`
  },

  /**
   * Generate standardized forbidden message for resource access
   * @param {string} action - Action being attempted (e.g., 'access', 'update', 'delete')
   * @param {string} resource - Resource type
   * @returns {string} Standardized error message
   */
  forbidden: (action, resource) => {
    return `Not authorized to ${action} this ${resource.toLowerCase()}`
  },

  /**
   * Common error messages
   */
  common: {
    invalidIdFormat: resource => `Invalid ${resource.toLowerCase()} ID format`,
    fileUploadRequired: 'Please upload a file',
    imageUploadRequired: 'Please upload an image',
  },
}

module.exports = {
  createError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validation,
  serverError,
  tooManyRequests,
  formatMongooseErrors,
  asyncHandler,
  errorMessages,
}
