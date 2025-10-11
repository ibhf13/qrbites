/* eslint-disable @typescript-eslint/no-explicit-any */

// Network error message constants
export const NETWORK_ERROR_MESSAGES = {
    CONNECTION_LOST: 'Connection lost. Please check your internet connection.',
    REQUEST_TIMEOUT: 'Request timed out. Please try again.',
    SERVER_UNAVAILABLE: 'Server is currently unavailable. Please try again later.'
} as const

/**
 * Checks if the error is a network-related error
 */
export const isNetworkError = (error: any): boolean => {
    return (
        error?.code === 'NETWORK_ERROR' ||
        error?.code === 'ECONNABORTED' ||
        (!error?.response && error?.request) ||
        error?.message?.includes('Network Error') ||
        error?.message?.includes('timeout')
    )
}

/**
 * Checks if the error is a server error (5xx status codes)
 */
export const isServerError = (error: any): boolean => {
    const status = error?.response?.status || error?.status
    return status >= 500 && status < 600
}

/**
 * Gets user-friendly network error message
 */
export const getNetworkErrorMessage = (error: any): string => {
    if (isNetworkError(error)) {
        if (error?.message?.includes('timeout')) {
            return NETWORK_ERROR_MESSAGES.REQUEST_TIMEOUT
        }
        return NETWORK_ERROR_MESSAGES.CONNECTION_LOST
    }

    if (isServerError(error)) {
        return NETWORK_ERROR_MESSAGES.SERVER_UNAVAILABLE
    }

    return NETWORK_ERROR_MESSAGES.CONNECTION_LOST
}

/**
 * Determines if an operation should be retried based on error type
 */
export const shouldRetryNetworkOperation = (error: any, attemptCount: number, maxRetries: number = 3): boolean => {
    // Don't retry auth errors, validation errors, or client errors
    if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 422) {
        return false
    }

    // Don't retry 404 errors
    if (error?.response?.status === 404) {
        return false
    }

    // Retry network errors and server errors
    if (isNetworkError(error) || isServerError(error)) {
        return attemptCount < maxRetries
    }

    return false
}
