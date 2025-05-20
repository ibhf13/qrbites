export const MENU_CATEGORIES = [
    { value: 'appetizers', label: 'Appetizers' },
    { value: 'main-course', label: 'Main Course' },
    { value: 'desserts', label: 'Desserts' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'salads', label: 'Salads' },
    { value: 'soups', label: 'Soups' },
    { value: 'sides', label: 'Sides' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' }
] as const

export const MENU_SORT_OPTIONS = [
    { value: 'name', label: 'Name' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' },
    { value: 'isActive', label: 'Status' }
] as const

export const MENU_ORDER_OPTIONS = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' }
] as const

export const MENU_STATUS_OPTIONS = [
    { value: 'all', label: 'All Menus' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' }
] as const

export const MENU_LIMITS = [
    { value: 5, label: '5 per page' },
    { value: 10, label: '10 per page' },
    { value: 20, label: '20 per page' },
    { value: 50, label: '50 per page' }
] as const

export const DEFAULT_MENU_FILTERS = {
    page: 1,
    limit: 10,
    sortBy: 'updatedAt',
    order: 'desc' as const
}

export const MENU_IMAGE_CONSTRAINTS = {
    maxSize: 5 * 1024 * 1024,
    maxFiles: 10,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    dimensions: {
        maxWidth: 2048,
        maxHeight: 2048,
        minWidth: 300,
        minHeight: 300
    }
} as const

export { QR_CODE_SIZES, QR_CODE_FORMATS } from '@/features/qr'

export const QR_ERROR_CORRECTION_LEVELS = [
    { value: 'L', label: 'Low (7%)', description: 'Suitable for clean environments' },
    { value: 'M', label: 'Medium (15%)', description: 'Balanced durability and size' },
    { value: 'Q', label: 'Quartile (25%)', description: 'Good for industrial use' },
    { value: 'H', label: 'High (30%)', description: 'Maximum error recovery' }
] as const

export { DEFAULT_QR_CUSTOMIZATION } from '@/features/qr'

export const QR_CODE_BULK_OPERATIONS = [
    { value: 'generate', label: 'Generate Missing QR Codes', description: 'Create QR codes for menus that don\'t have one' },
    { value: 'regenerate', label: 'Regenerate All QR Codes', description: 'Replace existing QR codes with new ones' },
    { value: 'download', label: 'Download QR Codes', description: 'Download all QR codes as a ZIP file' },
    { value: 'delete', label: 'Delete QR Codes', description: 'Remove QR codes from selected menus' }
] as const

export const QR_ANALYTICS_REFRESH_INTERVAL = 30000

export { QR_CODE_TIPS } from '@/features/qr' 