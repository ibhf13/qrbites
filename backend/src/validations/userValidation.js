const Joi = require('joi')
const { paginationSchema, searchSchema } = require('./commonValidation')

/**
 * Validation schema for updating user by admin
 */
const updateUserSchema = Joi.object({
    email: Joi.string()
        .email()
        .messages({
            'string.email': 'Please provide a valid email address'
        }),

    role: Joi.string()
        .valid('user', 'admin')
        .messages({
            'any.only': 'Role must be either user or admin'
        }),

    isActive: Joi.boolean()
        .messages({
            'boolean.base': 'isActive must be a boolean value'
        })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
})

/**
 * Validation schema for user query parameters
 */
const getUsersQuerySchema = Joi.object({
    ...paginationSchema,
    ...searchSchema,

    role: Joi.string()
        .valid('user', 'admin')
        .messages({
            'any.only': 'Role must be either user or admin'
        }),

    isActive: Joi.string()
        .valid('true', 'false')
        .messages({
            'any.only': 'isActive must be either true or false'
        })
})

module.exports = {
    updateUserSchema,
    getUsersQuerySchema
} 