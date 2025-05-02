const Joi = require('joi')

// Schema for creating a new restaurant
const restaurantSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.base': 'Name must be a text',
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 100 characters',
            'any.required': 'Name is required'
        }),

    description: Joi.string()
        .max(1000)
        .allow('')
        .optional()
        .messages({
            'string.base': 'Description must be a text',
            'string.max': 'Description cannot exceed 1000 characters'
        }),

    cuisineType: Joi.array()
        .items(Joi.string())
        .optional()
        .messages({
            'array.base': 'Cuisine type must be an array'
        }),

    address: Joi.object({
        street: Joi.string().required().messages({
            'string.base': 'Street must be a text',
            'any.required': 'Street is required'
        }),
        city: Joi.string().required().messages({
            'string.base': 'City must be a text',
            'any.required': 'City is required'
        }),
        state: Joi.string().required().messages({
            'string.base': 'State must be a text',
            'any.required': 'State is required'
        }),
        zipCode: Joi.string().required().messages({
            'string.base': 'Zip code must be a text',
            'any.required': 'Zip code is required'
        }),
        country: Joi.string().required().messages({
            'string.base': 'Country must be a text',
            'any.required': 'Country is required'
        })
    }).optional(),

    contact: Joi.object({
        phone: Joi.string().required().messages({
            'string.base': 'Phone must be a text',
            'any.required': 'Phone is required'
        }),
        email: Joi.string().email().optional().messages({
            'string.base': 'Email must be a text',
            'string.email': 'Please provide a valid email'
        }),
        website: Joi.string().uri().optional().messages({
            'string.base': 'Website must be a text',
            'string.uri': 'Please provide a valid URL'
        })
    }).optional(),

    operatingHours: Joi.array()
        .items(
            Joi.object({
                day: Joi.string().required(),
                open: Joi.string().required(),
                close: Joi.string().required(),
                isClosed: Joi.boolean().default(false)
            })
        )
        .optional(),

    isActive: Joi.boolean()
        .optional()
        .messages({
            'boolean.base': 'Status must be true or false'
        })
})

// Schema for updating a restaurant
const restaurantUpdateSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.base': 'Name must be a text',
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 100 characters'
        }),

    description: Joi.string()
        .max(1000)
        .allow('')
        .optional()
        .messages({
            'string.base': 'Description must be a text',
            'string.max': 'Description cannot exceed 1000 characters'
        }),

    cuisineType: Joi.array()
        .items(Joi.string())
        .optional()
        .messages({
            'array.base': 'Cuisine type must be an array'
        }),

    address: Joi.object({
        street: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        zipCode: Joi.string().optional(),
        country: Joi.string().optional()
    }).optional(),

    contact: Joi.object({
        phone: Joi.string().optional(),
        email: Joi.string().email().optional().messages({
            'string.email': 'Please provide a valid email'
        }),
        website: Joi.string().uri().optional().messages({
            'string.uri': 'Please provide a valid URL'
        })
    }).optional(),

    operatingHours: Joi.array()
        .items(
            Joi.object({
                day: Joi.string().required(),
                open: Joi.string().required(),
                close: Joi.string().required(),
                isClosed: Joi.boolean().default(false)
            })
        )
        .optional(),

    isActive: Joi.boolean()
        .optional()
        .messages({
            'boolean.base': 'Status must be true or false'
        })
})

module.exports = {
    restaurantSchema,
    restaurantUpdateSchema
} 