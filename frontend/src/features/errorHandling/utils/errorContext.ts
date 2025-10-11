

// Error message constants for different contexts
export const ERROR_MESSAGES = {
    PROFILE: {
        UPDATE_PROFILE: 'Failed to update profile. Please try again.',
        CHANGE_PASSWORD: 'Failed to change password. Please try again.',
        LOAD_PROFILE: 'Failed to load profile data. Please try again.'
    },
    RESTAURANT: {
        CREATE_FAILED: 'Failed to create restaurant. Please try again.',
        UPDATE_FAILED: 'Failed to update restaurant. Please try again.',
        DELETE_FAILED: 'Failed to delete restaurant. Please try again.',
        LOAD_FAILED: 'Failed to load restaurants. Please try again.'
    },
    MENU: {
        CREATE_FAILED: 'Failed to create menu. Please try again.',
        UPDATE_FAILED: 'Failed to update menu. Please try again.',
        DELETE_FAILED: 'Failed to delete menu. Please try again.',
        LOAD_FAILED: 'Failed to load menus. Please try again.',
        GENERATE_QR_FAILED: 'Failed to generate QR code. Please try again.'
    }
} as const

/**
 * Gets context-specific error message based on context
 */
export const getContextErrorMessage = (context: string): string | null => {
    const contextLower = context.toLowerCase()

    if (contextLower.includes('profile')) {
        if (contextLower.includes('update')) return ERROR_MESSAGES.PROFILE.UPDATE_PROFILE
        if (contextLower.includes('password')) return ERROR_MESSAGES.PROFILE.CHANGE_PASSWORD

        return ERROR_MESSAGES.PROFILE.LOAD_PROFILE
    }

    if (contextLower.includes('restaurant')) {
        if (contextLower.includes('create')) return ERROR_MESSAGES.RESTAURANT.CREATE_FAILED
        if (contextLower.includes('update')) return ERROR_MESSAGES.RESTAURANT.UPDATE_FAILED
        if (contextLower.includes('delete')) return ERROR_MESSAGES.RESTAURANT.DELETE_FAILED

        return ERROR_MESSAGES.RESTAURANT.LOAD_FAILED
    }

    if (contextLower.includes('menu')) {
        if (contextLower.includes('create')) return ERROR_MESSAGES.MENU.CREATE_FAILED
        if (contextLower.includes('update')) return ERROR_MESSAGES.MENU.UPDATE_FAILED
        if (contextLower.includes('delete')) return ERROR_MESSAGES.MENU.DELETE_FAILED
        if (contextLower.includes('qr')) return ERROR_MESSAGES.MENU.GENERATE_QR_FAILED

        return ERROR_MESSAGES.MENU.LOAD_FAILED
    }

    return null
}
