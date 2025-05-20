import { z } from 'zod'
import { MENU_CATEGORIES, MENU_IMAGE_CONSTRAINTS } from '../constants/menu.const'

const categoryValues = MENU_CATEGORIES.map(cat => cat.value) as [string, ...string[]]

export const menuFormSchema = z.object({
    name: z
        .string()
        .min(3, 'Menu name must be at least 3 characters')
        .max(50, 'Menu name cannot exceed 50 characters')
        .trim(),
    
    description: z
        .string()
        .max(500, 'Description cannot exceed 500 characters')
        .trim()
        .optional()
        .or(z.literal('')),
    
    restaurantId: z
        .string()
        .min(1, 'Restaurant is required'),
    
    isActive: z
        .boolean()
        .default(true),
    
    categories: z
        .array(z.enum(categoryValues))
        .optional()
        .default([]),
    
    images: z
        .array(z.instanceof(File))
        .optional()
        .refine(
            (files) => !files || files.length <= MENU_IMAGE_CONSTRAINTS.maxFiles,
            `Maximum ${MENU_IMAGE_CONSTRAINTS.maxFiles} images allowed`
        )
        .refine(
            (files) => 
                !files || 
                files.every(file => file.size <= MENU_IMAGE_CONSTRAINTS.maxSize),
            `Each image must be less than ${MENU_IMAGE_CONSTRAINTS.maxSize / (1024 * 1024)}MB`
        )
        .refine(
            (files) =>
                !files ||
                files.every(file => MENU_IMAGE_CONSTRAINTS.acceptedTypes.includes(file.type as any)),
            'Only JPEG, PNG, and WebP images are allowed'
        )
})

export const menuUpdateSchema = menuFormSchema.partial().omit({ restaurantId: true })

export const menuFiltersSchema = z.object({
    search: z.string().optional(),
    isActive: z.boolean().optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(100).optional(),
    sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'isActive']).optional(),
    order: z.enum(['asc', 'desc']).optional()
}) 