const Joi = require('joi')
const { paginationSchema, searchSchema } = require('./commonValidation')

/**
 * Base profile fields schema - shared between user and admin updates
 */
const baseProfileFields = {
    firstName: Joi.string()
        .min(2)
        .max(50)
        .messages({
            'string.min': 'First name must be at least 2 characters long',
            'string.max': 'First name cannot be longer than 50 characters'
        }),

    lastName: Joi.string()
        .min(2)
        .max(50)
        .messages({
            'string.min': 'Last name must be at least 2 characters long',
            'string.max': 'Last name cannot be longer than 50 characters'
        }),

    displayName: Joi.string()
        .min(2)
        .max(50)
        .messages({
            'string.min': 'Display name must be at least 2 characters long',
            'string.max': 'Display name cannot be longer than 50 characters'
        }),

    phone: Joi.string()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .messages({
            'string.pattern.base': 'Please provide a valid phone number'
        }),

    bio: Joi.string()
        .max(500)
        .messages({
            'string.max': 'Bio cannot be longer than 500 characters'
        }),

    dateOfBirth: Joi.date()
        .max('now')
        .messages({
            'date.max': 'Date of birth must be in the past'
        }),

    location: Joi.object({
        street: Joi.string()
            .max(100)
            .messages({
                'string.max': 'Street cannot be longer than 100 characters'
            }),
        houseNumber: Joi.string()
            .max(10)
            .messages({
                'string.max': 'House number cannot be longer than 10 characters'
            }),
        city: Joi.string()
            .max(50)
            .messages({
                'string.max': 'City cannot be longer than 50 characters'
            }),
        zipCode: Joi.string()
            .pattern(/^[0-9]{5}$/)
            .messages({
                'string.pattern.base': 'Please provide a valid German postal code (5 digits, e.g., 12345)'
            })
    }),

    preferences: Joi.object({
        language: Joi.string()
            .valid('en', 'es', 'fr', 'de', 'it', 'pt')
            .messages({
                'any.only': 'Language must be one of: en, es, fr, de, it, pt'
            }),
        timezone: Joi.string()
            .messages({
                'string.base': 'Timezone must be a string'
            }),
        notifications: Joi.object({
            email: Joi.boolean(),
            sms: Joi.boolean(),
            push: Joi.boolean()
        })
    }),

    socialLinks: Joi.object({
        website: Joi.string()
            .uri()
            .messages({
                'string.uri': 'Website must be a valid URL'
            }),
        twitter: Joi.string()
            .pattern(/^@?[A-Za-z0-9_]{1,15}$/)
            .messages({
                'string.pattern.base': 'Please provide a valid Twitter handle'
            }),
        instagram: Joi.string()
            .pattern(/^@?[A-Za-z0-9_.]{1,30}$/)
            .messages({
                'string.pattern.base': 'Please provide a valid Instagram handle'
            }),
        linkedin: Joi.string()
            .pattern(/^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-]+\/?$/)
            .messages({
                'string.pattern.base': 'Please provide a valid LinkedIn URL'
            })
    })
}

/**
 * Validation schema for updating user's own profile
 */
const updateProfileSchema = Joi.object(baseProfileFields)

/**
 * Validation schema for admin updating user profiles
 * (includes additional fields like isVerified)
 */
const updateUserProfileSchema = Joi.object({
    ...baseProfileFields,

    // Admin-only fields
    isPublic: Joi.boolean()
        .messages({
            'boolean.base': 'isPublic must be a boolean value'
        }),

    isVerified: Joi.boolean()
        .messages({
            'boolean.base': 'isVerified must be a boolean value'
        })
})

/**
 * Validation schema for privacy settings
 */
const privacySettingsSchema = Joi.object({
    isPublic: Joi.boolean()
        .required()
        .messages({
            'boolean.base': 'isPublic must be a boolean value',
            'any.required': 'isPublic is required'
        })
})

/**
 * Validation schema for profile query parameters
 */
const getProfilesQuerySchema = Joi.object({
    ...paginationSchema,
    ...searchSchema,

    isPublic: Joi.string()
        .valid('true', 'false')
        .messages({
            'any.only': 'isPublic must be either true or false'
        }),

    isVerified: Joi.string()
        .valid('true', 'false')
        .messages({
            'any.only': 'isVerified must be either true or false'
        }),

    language: Joi.string()
        .valid('en', 'es', 'fr', 'de', 'it', 'pt')
        .messages({
            'any.only': 'Language must be one of: en, es, fr, de, it, pt'
        })
})

module.exports = {
    updateProfileSchema,
    updateUserProfileSchema,
    privacySettingsSchema,
    getProfilesQuerySchema
} 