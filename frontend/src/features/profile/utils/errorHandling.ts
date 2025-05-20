
export const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (typeof error === 'object' && error !== null && 'error' in error) {
        const errorObj = error as any

        if (typeof errorObj.error === 'object' && errorObj.error !== null && 'message' in errorObj.error) {
            return String(errorObj.error.message)
        }

        if (typeof errorObj.error === 'string') {
            return errorObj.error
        }
    }

    return defaultMessage
}


export const PROFILE_ERROR_MESSAGES = {
    UPDATE_PROFILE: 'Failed to update profile. Please try again.',
    CHANGE_PASSWORD: 'Failed to change password. Please try again.',
    UPLOAD_AVATAR: 'Failed to upload avatar. Please try again.',
    LOAD_PROFILE: 'Failed to load profile data. Please try again.'
} as const 