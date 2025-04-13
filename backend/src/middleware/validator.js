const Joi = require('joi');

/**
 * Validate request data against a Joi schema
 * @param {Object} schema - Joi schema to validate against
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    }

    next();
  };
};

/**
 * Registration validation schema
 */
const registrationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string().min(6).max(30).required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password cannot exceed 30 characters',
      'any.required': 'Password is required'
    }),
  restaurantName: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Restaurant name must be at least 2 characters',
      'string.max': 'Restaurant name cannot exceed 100 characters',
      'any.required': 'Restaurant name is required'
    })
});

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string().required()
    .messages({
      'any.required': 'Password is required'
    })
});

module.exports = {
  validate,
  registrationSchema,
  loginSchema
}; 