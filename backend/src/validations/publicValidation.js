const Joi = require('joi')
const mongoose = require('mongoose')

// Schema for validating menu ID parameter
const menuIdSchema = Joi.object({
    menuId: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid')
            }
            return value
        })
        .required()
        .messages({
            'any.required': 'Menu ID is required',
            'any.invalid': 'Invalid menu ID format'
        })
})

// Schema for validating restaurant ID parameter
const restaurantIdSchema = Joi.object({
    restaurantId: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid')
            }
            return value
        })
        .required()
        .messages({
            'any.required': 'Restaurant ID is required',
            'any.invalid': 'Invalid restaurant ID format'
        })
})

// Schema for validating query parameters for menu items
const menuItemsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    category: Joi.string().trim().allow(''),
    search: Joi.string().trim().allow('')
})

module.exports = {
    menuIdSchema,
    restaurantIdSchema,
    menuItemsQuerySchema
} 