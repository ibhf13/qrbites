const Joi = require('joi')

const restaurantSchema = Joi.object({
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

  location: Joi.object({
    street: Joi.string().max(100).required().messages({
      'string.base': 'Street must be a text',
      'string.max': 'Street cannot exceed 100 characters',
      'any.required': 'Street is required',
    }),
    houseNumber: Joi.string().max(5).required().messages({
      'string.base': 'House number must be a text',
      'string.max': 'House number cannot exceed 5 characters',
      'any.required': 'House number is required',
    }),
    city: Joi.string().max(50).required().messages({
      'string.base': 'City must be a text',
      'string.max': 'City cannot exceed 50 characters',
      'any.required': 'City is required',
    }),

    zipCode: Joi.string()
      .pattern(/^\d{5}$/)
      .required()
      .messages({
        'string.base': 'Zip code must be a text',
        'string.pattern.base': 'Please provide a valid German postal code (5 digits, e.g., 12345)',
        'any.required': 'Zip code is required',
      }),
  })
    .required()
    .messages({
      'object.base': 'Location information is required',
      'any.required': 'Location information is required',
    }),

  contact: Joi.object({
    phone: Joi.string()
      .pattern(/^\+[1-9]\d{7,14}$/)
      .required()
      .messages({
        'string.base': 'Phone must be a text',
        'string.pattern.base':
          'Please provide a valid phone number in E.164 format (e.g., +491234567890)',
        'any.required': 'Phone is required',
      }),
    email: Joi.string().email().optional().messages({
      'string.base': 'Email must be a text',
      'string.email': 'Please provide a valid email',
    }),
    website: Joi.string().uri().optional().messages({
      'string.base': 'Website must be a text',
      'string.uri': 'Please provide a valid URL',
    }),
  })
    .required()
    .messages({
      'object.base': 'Contact information is required',
      'any.required': 'Contact information is required',
    }),

  hours: Joi.array()
    .items(
      Joi.object({
        day: Joi.number().min(0).max(6).required(),
        closed: Joi.boolean().required(),
        open: Joi.string()
          .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
          .when('closed', {
            is: false,
            then: Joi.required(),
            otherwise: Joi.optional(),
          })
          .messages({
            'string.pattern.base': 'Open time must be in HH:MM format (e.g., 09:00)',
          }),
        close: Joi.string()
          .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
          .when('closed', {
            is: false,
            then: Joi.required(),
            otherwise: Joi.optional(),
          })
          .messages({
            'string.pattern.base': 'Close time must be in HH:MM format (e.g., 22:00)',
          }),
      })
    )
    .length(7)
    .required()
    .messages({
      'array.base': 'Business hours must be an array',
      'array.length': 'Business hours must include all 7 days',
      'any.required': 'Business hours are required',
    }),

  logoUrl: Joi.string().uri().optional().messages({
    'string.base': 'Logo URL must be a text',
    'string.uri': 'Please provide a valid URL for logo',
  }),

  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'Status must be true or false',
  }),
})

const restaurantUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional().messages({
    'string.base': 'Name must be a text',
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name cannot exceed 50 characters',
  }),

  description: Joi.string().max(500).allow('').optional().messages({
    'string.base': 'Description must be a text',
    'string.max': 'Description cannot exceed 500 characters',
  }),

  location: Joi.object({
    street: Joi.string().max(100).optional().messages({
      'string.max': 'Street cannot exceed 100 characters',
    }),
    houseNumber: Joi.string().max(5).optional().messages({
      'string.max': 'House number cannot exceed 5 characters',
    }),
    city: Joi.string().max(50).optional().messages({
      'string.max': 'City cannot exceed 50 characters',
    }),

    zipCode: Joi.string()
      .pattern(/^\d{5}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid German postal code (5 digits, e.g., 12345)',
      }),
  }).optional(),

  contact: Joi.object({
    phone: Joi.string()
      .pattern(/^\+[1-9]\d{7,14}$/)
      .optional()
      .messages({
        'string.pattern.base':
          'Please provide a valid phone number in E.164 format (e.g., +491234567890)',
      }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Please provide a valid email',
    }),
    website: Joi.string().uri().optional().messages({
      'string.uri': 'Please provide a valid URL',
    }),
  }).optional(),

  hours: Joi.array()
    .items(
      Joi.object({
        day: Joi.number().min(0).max(6).required(),
        closed: Joi.boolean().required(),
        open: Joi.string()
          .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
          .when('closed', {
            is: false,
            then: Joi.required(),
            otherwise: Joi.optional(),
          })
          .messages({
            'string.pattern.base': 'Open time must be in HH:MM format (e.g., 09:00)',
          }),
        close: Joi.string()
          .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
          .when('closed', {
            is: false,
            then: Joi.required(),
            otherwise: Joi.optional(),
          })
          .messages({
            'string.pattern.base': 'Close time must be in HH:MM format (e.g., 22:00)',
          }),
      })
    )
    .length(7)
    .optional(),

  logoUrl: Joi.string().uri().optional().messages({
    'string.base': 'Logo URL must be a text',
    'string.uri': 'Please provide a valid URL for logo',
  }),

  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'Status must be true or false',
  }),
})

module.exports = {
  restaurantSchema,
  restaurantUpdateSchema,
}
