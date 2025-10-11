import { z } from 'zod'
import { VALIDATION_MESSAGES } from '../constants/restaurant.const'

export const contactSchema = z.object({
    phone: z.string().regex(/^\+[1-9]\d{7,14}$/, VALIDATION_MESSAGES.INVALID_PHONE),
    email: z.string().regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, VALIDATION_MESSAGES.INVALID_EMAIL).optional(),
    website: z.string().url(VALIDATION_MESSAGES.INVALID_WEBSITE).optional(),
})

export const locationSchema = z.object({
    street: z.string().min(1, VALIDATION_MESSAGES.REQUIRED).max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
    houseNumber: z.string().min(1, VALIDATION_MESSAGES.REQUIRED).max(5, VALIDATION_MESSAGES.MAX_LENGTH(5)),
    city: z.string().min(1, VALIDATION_MESSAGES.REQUIRED).max(50, VALIDATION_MESSAGES.MAX_LENGTH(50)),
    zipCode: z.string().regex(/^\d{5}$/, VALIDATION_MESSAGES.INVALID_ZIP),
})

export const businessHoursSchema = z.object({
    day: z.number().min(0).max(6),
    open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, VALIDATION_MESSAGES.INVALID_TIME).optional(),
    close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, VALIDATION_MESSAGES.INVALID_TIME).optional(),
    closed: z.boolean(),
}).refine((data) => {
    if (!data.closed) {
        return data.open && data.close
    }

    return true
}, {
    message: 'Open and close times are required when not closed',
    path: ['open'],
}).refine((data) => {
    if (!data.closed) {
        return data.open && data.close
    }

    return true
}, {
    message: 'Open and close times are required when not closed',
    path: ['close'],
})

export const restaurantFormSchema = z.object({
    name: z.string()
        .min(3, VALIDATION_MESSAGES.MIN_LENGTH(3))
        .max(50, VALIDATION_MESSAGES.MAX_LENGTH(50)),
    description: z.string()
        .max(500, VALIDATION_MESSAGES.MAX_LENGTH(500))
        .optional(),
    contact: contactSchema,
    location: locationSchema,
    hours: z.array(businessHoursSchema)
        .length(7, 'Business hours must include all 7 days'),
    logo: z.any().optional(),
    isActive: z.boolean().optional().default(true),
})

export const validateLogoFile = (file: File | null) => {
    if (!file) return true

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, or JPG image.')
    }

    if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB.')
    }

    return true
} 