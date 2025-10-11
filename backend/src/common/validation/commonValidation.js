const Joi = require('joi')
const mongoose = require('mongoose')

/**
 * Custom validation for MongoDB ObjectId
 * @param {string} value - The value to validate
 * @param {Object} helpers - Joi helpers object
 * @returns {string|Error} Valid ObjectId or error
 */
const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid')
  }
  return value
}

/**
 * Common pagination schema for query parameters
 */
const paginationSchema = {
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot be more than 100',
  }),
}

/**
 * Common search schema
 */
const searchSchema = {
  search: Joi.string().min(1).max(100).messages({
    'string.min': 'Search term must be at least 1 character',
    'string.max': 'Search term cannot be longer than 100 characters',
  }),
}

/**
 * Common ObjectId parameter schema
 */
const objectIdSchema = Joi.string().custom(validateObjectId).messages({
  'any.invalid': 'Invalid ID format',
})

module.exports = {
  validateObjectId,
  paginationSchema,
  searchSchema,
  objectIdSchema,
}
