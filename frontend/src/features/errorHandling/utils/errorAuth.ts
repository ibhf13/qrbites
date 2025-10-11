/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiErrorResponse } from '@/config/api'

// Error message constants for authentication
export const AUTH_ERROR_MESSAGES = {
    LOGIN_FAILED: 'Login failed. Please check your credentials.',
    REGISTER_FAILED: 'Registration failed. Please try again.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You do not have permission to perform this action.'
} as const

/**
 * Checks if the response is an authentication error
 */
export const isAuthenticationError = (response: any): boolean => {
    const status = response?.response?.status || response?.status

    if (status === 401) return true

    // Check specific error messages from QrBites API
    const authErrors = ['Not authorized, no token', 'Invalid token', 'Token expired']
    let errorMessage = ''

    if (isApiErrorResponse(response)) {
        errorMessage = response.error
    } else if (response?.response?.data && isApiErrorResponse(response.response.data)) {
        errorMessage = response.response.data.error
    } else if (response?.message) {
        errorMessage = response.message
    }

    return authErrors.some(authError => errorMessage.includes(authError))
}

/**
 * Checks if the response is an authorization error
 */
export const isAuthorizationError = (response: any): boolean => {
    let errorMessage = ''

    if (response?.response?.status === 403 || response?.status === 403) return true

    if (isApiErrorResponse(response)) {
        errorMessage = response.error
    } else if (response?.response?.data && isApiErrorResponse(response.response.data)) {
        errorMessage = response.response.data.error
    }

    return errorMessage === 'Not authorized to access this route'
}

/**
 * Gets user-friendly authentication error message
 */
export const getAuthErrorMessage = (response: any): string => {
    if (!isAuthenticationError(response)) {
        return AUTH_ERROR_MESSAGES.UNAUTHORIZED
    }

    let apiError: ApiErrorResponse | null = null

    if (isApiErrorResponse(response)) {
        apiError = response
    } else if (response?.response?.data && isApiErrorResponse(response.response.data)) {
        apiError = response.response.data
    }

    if (apiError) {
        const authMessages: Record<string, string> = {
            'Not authorized, no token': 'Please log in to continue',
            'Invalid token': 'Your session is invalid. Please log in again',
            'Token expired': 'Your session has expired. Please log in again'
        }

        return authMessages[apiError.error] || 'Authentication required. Please log in.'
    }

    return AUTH_ERROR_MESSAGES.SESSION_EXPIRED
}

/**
 * Gets context-specific authentication error message
 */
export const getContextAuthErrorMessage = (errorMessage: string, context: string): string | null => {
    const contextLower = context.toLowerCase()

    // Authentication context
    if (contextLower.includes('login')) {
        if (errorMessage.includes('Invalid credentials') || errorMessage.includes('Incorrect email or password')) {
            return 'Invalid email or password. Please check your credentials and try again.'
        }

        if (errorMessage.includes('Account is disabled')) {
            return 'Your account has been disabled. Please contact support.'
        }

        return AUTH_ERROR_MESSAGES.LOGIN_FAILED
    }

    if (contextLower.includes('register')) {
        if (errorMessage.includes('Email already exists')) {
            return 'An account with this email already exists. Please try logging in instead.'
        }

        if (errorMessage.includes('Password must be at least')) {
            return 'Password must be at least 6 characters long.'
        }

        return AUTH_ERROR_MESSAGES.REGISTER_FAILED
    }

    if (contextLower.includes('password')) {
        if (errorMessage.includes('Current password is incorrect')) {
            return 'Current password is incorrect. Please try again.'
        }

        if (errorMessage.includes('New password must be different')) {
            return 'New password must be different from your current password.'
        }

        return 'Password change failed. Please check your current password and try again.'
    }

    return null
}

/**
 * Helper function to check if response is API error response
 */
const isApiErrorResponse = (response: any): response is ApiErrorResponse => {
    return (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        response.success === false &&
        'error' in response &&
        typeof response.error === 'string'
    )
}
