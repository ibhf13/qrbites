import * as z from 'zod'

export const profileFormSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
    phoneNumber: z.string()
        .min(10, 'Phone number must be at least 10 digits')
        .max(15, 'Phone number cannot exceed 15 digits')
        .regex(/^[+]?[0-9\s-()]+$/, 'Invalid phone number format')
        .optional()
        .or(z.literal(''))
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