const Joi = require('joi')
const { validateObjectId } = require('./commonValidation')

const menuSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.base': 'Name must be a text',
            'string.min': 'Name must be at least 3 characters',
            'string.max': 'Name cannot exceed 50 characters',
            'any.required': 'Name is required'
        }),

    description: Joi.string()
        .max(500)
        .allow('')
        .optional()
        .messages({
            'string.base': 'Description must be a text',
            'string.max': 'Description cannot exceed 500 characters'
        }),

    isActive: Joi.boolean()
        .optional()
        .messages({
            'boolean.base': 'Status must be true or false'
        }),

    categories: Joi.array()
        .items(Joi.string())
        .optional()
        .messages({
            'array.base': 'Categories must be an array'
        }),

    restaurantId: Joi.string()
        .required()
        .custom(validateObjectId)
        .messages({
            'string.base': 'Restaurant ID must be a string',
            'any.required': 'Restaurant ID is required',
            'any.invalid': 'Restaurant ID is not a valid ID'
        })
})

// Schema for updating a menu
const menuUpdateSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .optional()
        .messages({
            'string.base': 'Name must be a text',
            'string.min': 'Name must be at least 3 characters',
            'string.max': 'Name cannot exceed 50 characters'
        }),

    description: Joi.string()
        .max(500)
        .allow('')
        .optional()
        .messages({
            'string.base': 'Description must be a text',
            'string.max': 'Description cannot exceed 500 characters'
        }),

    isActive: Joi.boolean()
        .optional()
        .messages({
            'boolean.base': 'Status must be true or false'
        }),

    categories: Joi.array()
        .items(Joi.string())
        .optional()
        .messages({
            'array.base': 'Categories must be an array'
        })
})

module.exports = {
    menuSchema,
    menuUpdateSchema
} 