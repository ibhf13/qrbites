import * as z from 'zod'

export const basicInfoSchema = z.object({
    firstName: z.string()
        .min(2, 'First name must be at least 2 characters long')
        .max(50, 'First name cannot be longer than 50 characters')
        .optional()
        .or(z.literal('')),
    lastName: z.string()
        .min(2, 'Last name must be at least 2 characters long')
        .max(50, 'Last name cannot be longer than 50 characters')
        .optional()
        .or(z.literal('')),
    displayName: z.string()
        .min(2, 'Display name must be at least 2 characters long')
        .max(50, 'Display name cannot be longer than 50 characters')
        .optional()
        .or(z.literal('')),
    phone: z.string()
        .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
        .optional()
        .or(z.literal('')),
    bio: z.string()
        .max(500, 'Bio cannot be longer than 500 characters')
        .optional()
        .or(z.literal('')),

})

export const locationSchema = z.object({
    street: z.string().max(100, 'Street cannot be longer than 100 characters').optional().or(z.literal('')),
    houseNumber: z.string().max(10, 'House number cannot be longer than 10 characters').optional().or(z.literal('')),
    city: z.string().max(50, 'City cannot be longer than 50 characters').optional().or(z.literal('')),
    zipCode: z.string().max(20, 'ZIP code cannot be longer than 20 characters').optional().or(z.literal('')),
    country: z.string().max(50, 'Country cannot be longer than 50 characters').optional().or(z.literal(''))
})

export const preferencesSchema = z.object({
    language: z.enum(['en', 'es', 'fr', 'de', 'it', 'pt']).default('en'),
    timezone: z.string().default('UTC'),
    notifications: z.object({
        email: z.boolean().default(true),
        sms: z.boolean().default(false),
        push: z.boolean().default(true)
    })
})

export const socialLinksSchema = z.object({
    website: z.string()
        .url('Please enter a valid URL')
        .optional()
        .or(z.literal('')),
    twitter: z.string()
        .regex(/^@?[A-Za-z0-9_]{1,15}$/, 'Invalid Twitter handle')
        .optional()
        .or(z.literal('')),
    instagram: z.string()
        .regex(/^@?[A-Za-z0-9_.]{1,30}$/, 'Invalid Instagram handle')
        .optional()
        .or(z.literal('')),
    linkedin: z.string()
        .url('Please enter a valid LinkedIn URL')
        .regex(/^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-]+\/?$/, 'Invalid LinkedIn profile URL')
        .optional()
        .or(z.literal(''))
})

export const privacySchema = z.object({
    isPublic: z.boolean().default(false)
})

export const profileSchema = z.object({
    ...basicInfoSchema.shape,
    location: locationSchema.optional(),
    preferences: preferencesSchema.optional(),
    socialLinks: socialLinksSchema.optional(),
    isPublic: z.boolean().optional()
})

export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(8, 'Current password must be at least 8 characters'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(64, 'Password cannot exceed 64 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmNewPassword: z.string().min(8, 'Please confirm your new password')
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword']
}) 