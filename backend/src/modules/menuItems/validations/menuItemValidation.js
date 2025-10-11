const Joi = require('joi')
const { validateObjectId } = require('@commonValidation/commonValidation')

const menuItemSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.base': 'Name must be a text',
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required',
  }),

  description: Joi.string().max(500).allow('').optional().messages({
    'string.base': 'Description must be a text',
    'string.max': 'Description cannot exceed 500 characters',
  }),

  price: Joi.number().min(0).required().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required',
  }),

  category: Joi.string().optional().messages({
    'string.base': 'Category must be a text',
  }),

  isAvailable: Joi.boolean().optional().messages({
    'boolean.base': 'Availability must be true or false',
  }),

  allergens: Joi.array().items(Joi.string()).optional().messages({
    'array.base': 'Allergens must be an array',
  }),

  calories: Joi.number().min(0).optional().messages({
    'number.base': 'Calories must be a number',
    'number.min': 'Calories cannot be negative',
  }),

  tags: Joi.array().items(Joi.string()).optional().messages({
    'array.base': 'Tags must be an array',
  }),

  menuId: Joi.string().required().custom(validateObjectId).messages({
    'string.base': 'Menu ID must be a string',
    'any.required': 'Menu ID is required',
    'any.invalid': 'Menu ID is not a valid ID',
  }),
})

// Schema for updating a menu item
const menuItemUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional().messages({
    'string.base': 'Name must be a text',
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name cannot exceed 50 characters',
  }),

  description: Joi.string().max(500).allow('').optional().messages({
    'string.base': 'Description must be a text',
    'string.max': 'Description cannot exceed 500 characters',
  }),

  price: Joi.number().min(0).optional().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price cannot be negative',
  }),

  category: Joi.string().optional().messages({
    'string.base': 'Category must be a text',
  }),

  isAvailable: Joi.boolean().optional().messages({
    'boolean.base': 'Availability must be true or false',
  }),

  allergens: Joi.array().items(Joi.string()).optional().messages({
    'array.base': 'Allergens must be an array',
  }),

  calories: Joi.number().min(0).optional().messages({
    'number.base': 'Calories must be a number',
    'number.min': 'Calories cannot be negative',
  }),

  tags: Joi.array().items(Joi.string()).optional().messages({
    'array.base': 'Tags must be an array',
  }),
})

module.exports = {
  menuItemSchema,
  menuItemUpdateSchema,
}
