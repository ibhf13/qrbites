const { ValidationError, BadRequestError, errorMessages, logDatabaseError } = require('@errors')
const logger = require('@commonUtils/logger')

/**
 * Validate request data using Joi schema
 * @param {Object} schema - Joi schema for validation (body, query, params)
 * @returns {Function} Express middleware
 */
const validateRequest = schema => {
  return (req, res, next) => {
    try {
      const validationOptions = {
        abortEarly: false, // Return all errors
        allowUnknown: true, // Allow unknown properties
        stripUnknown: true, // Remove unknown properties
      }

      const { error, value } = schema.validate(req.body, validationOptions)

      if (error) {
        const errors = {}

        error.details.forEach(detail => {
          const key = detail.path.join('.')
          errors[key] = detail.message.replace(/['"]/g, '')
        })

        logger.debug('Validation error', errors)

        return next(new ValidationError('Validation error', errors))
      }

      // Replace request body with validated data
      req.body = value
      return next()
    } catch (error) {
      if (error.name === 'CastError') {
        return next(new BadRequestError(errorMessages.common.invalidIdFormat('Request')))
      }
      logDatabaseError(error, 'VALIDATION', { operation: 'request_validation' })
      next(error)
    }
  }
}

/**
 * Middleware for validating query parameters
 * @param {Object} schema - Joi schema for query validation
 * @returns {Function} Express middleware
 */
const validateQuery = schema => {
  return (req, res, next) => {
    try {
      const validationOptions = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      }

      const { error, value } = schema.validate(req.query, validationOptions)

      if (error) {
        const errors = {}

        error.details.forEach(detail => {
          const key = detail.path.join('.')
          errors[key] = detail.message.replace(/['"]/g, '')
        })

        logger.debug('Query validation error', errors)

        return next(new ValidationError('Invalid query parameters', errors))
      }

      // Replace request query with validated data
      req.query = value
      return next()
    } catch (error) {
      if (error.name === 'CastError') {
        return next(new BadRequestError(errorMessages.common.invalidIdFormat('Query')))
      }
      logDatabaseError(error, 'VALIDATION', { operation: 'query_validation' })
      next(error)
    }
  }
}

/**
 * Middleware for validating route parameters
 * @param {Object} schema - Joi schema for params validation
 * @returns {Function} Express middleware
 */
const validateParams = schema => {
  return (req, res, next) => {
    try {
      const validationOptions = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      }

      const { error, value } = schema.validate(req.params, validationOptions)

      if (error) {
        const errors = {}

        error.details.forEach(detail => {
          const key = detail.path.join('.')
          errors[key] = detail.message.replace(/['"]/g, '')
        })

        logger.debug('Params validation error', errors)

        return next(new ValidationError('Invalid route parameters', errors))
      }

      // Replace request params with validated data
      req.params = value
      return next()
    } catch (error) {
      if (error.name === 'CastError') {
        return next(new BadRequestError(errorMessages.common.invalidIdFormat('Params')))
      }
      logDatabaseError(error, 'VALIDATION', { operation: 'params_validation' })
      next(error)
    }
  }
}

module.exports = {
  validateRequest,
  validateQuery,
  validateParams,
}
