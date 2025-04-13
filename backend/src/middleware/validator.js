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

/**
 * Menu validation schema
 */
const menuSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Menu name must be at least 2 characters',
      'string.max': 'Menu name cannot exceed 100 characters',
      'any.required': 'Menu name is required'
    }),
  description: Joi.string().max(500).allow('', null)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  isPublished: Joi.boolean()
});

/**
 * Section validation schema
 */
const sectionSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Section name must be at least 2 characters',
      'string.max': 'Section name cannot exceed 100 characters',
      'any.required': 'Section name is required'
    }),
  description: Joi.string().max(300).allow('', null)
    .messages({
      'string.max': 'Section description cannot exceed 300 characters'
    }),
  order: Joi.number().min(0).allow(null)
});

/**
 * MenuItem validation schema
 */
const menuItemSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Item name must be at least 2 characters',
      'string.max': 'Item name cannot exceed 100 characters',
      'any.required': 'Item name is required'
    }),
  description: Joi.string().max(500).allow('', null)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  price: Joi.number().min(0).required()
    .messages({
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD').default('USD'),
  isAvailable: Joi.boolean().default(true),
  section: Joi.string().required()
    .messages({
      'any.required': 'Section is required'
    }),
  order: Joi.number().min(0).default(0),
  tags: Joi.array().items(Joi.string().trim()),
  nutritionalInfo: Joi.object({
    calories: Joi.number().allow(null),
    allergens: Joi.array().items(Joi.string()),
    dietary: Joi.array().items(Joi.string())
  }).allow(null)
});

module.exports = {
  validate,
  registrationSchema,
  loginSchema,
  menuSchema,
  sectionSchema,
  menuItemSchema
}; 