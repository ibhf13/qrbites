const Joi = require('joi')

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

    location: Joi.object({
        street: Joi.string().required().messages({
            'string.base': 'Street must be a text',
            'any.required': 'Street is required'
        }),
        houseNumber: Joi.string().required().messages({
            'string.base': 'House number must be a text',
            'any.required': 'House number is required'
        }),
        city: Joi.string().required().messages({
            'string.base': 'City must be a text',
            'any.required': 'City is required'
        }),
        zipCode: Joi.string().pattern(/^[0-9]{5}$/).required().messages({
            'string.base': 'Zip code must be a text',
            'string.pattern.base': 'Please provide a valid German postal code (5 digits, e.g., 12345)',
            'any.required': 'Zip code is required'
        })
    }).required().messages({
        'object.base': 'Location information is required',
        'any.required': 'Location information is required'
    }),

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
    }).required().messages({
        'object.base': 'Contact information is required',
        'any.required': 'Contact information is required'
    }),

    hours: Joi.array()
        .items(
            Joi.object({
                day: Joi.number().min(0).max(6).required(),
                closed: Joi.boolean().required(),
                open: Joi.string().when('closed', {
                    is: false,
                    then: Joi.required(),
                    otherwise: Joi.optional()
                }),
                close: Joi.string().when('closed', {
                    is: false,
                    then: Joi.required(),
                    otherwise: Joi.optional()
                })
            })
        )
        .length(7)
        .required()
        .messages({
            'array.base': 'Business hours must be an array',
            'array.length': 'Business hours must include all 7 days',
            'any.required': 'Business hours are required'
        }),

    isActive: Joi.boolean()
        .optional()
        .messages({
            'boolean.base': 'Status must be true or false'
        })
})

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

    location: Joi.object({
        street: Joi.string().optional(),
        houseNumber: Joi.string().optional(),
        city: Joi.string().optional(),
        zipCode: Joi.string().pattern(/^[0-9]{5}$/).optional().messages({
            'string.pattern.base': 'Please provide a valid German postal code (5 digits, e.g., 12345)'
        })
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

    hours: Joi.array()
        .items(
            Joi.object({
                day: Joi.number().min(0).max(6).required(),
                closed: Joi.boolean().required(),
                open: Joi.string().when('closed', {
                    is: false,
                    then: Joi.required(),
                    otherwise: Joi.optional()
                }),
                close: Joi.string().when('closed', {
                    is: false,
                    then: Joi.required(),
                    otherwise: Joi.optional()
                })
            })
        )
        .length(7)
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