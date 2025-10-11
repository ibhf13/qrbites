/**
 * Shared API utilities for common patterns across API modules
 */

/**
 * Builds query string from parameters object
 * @param params - Object with key-value pairs for query parameters
 * @returns URL-encoded query string
 */
export const buildQueryString = (params: Record<string, string | number | boolean | undefined>): string => {
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value))
        }
    })

    return queryParams.toString()
}

/**
 * Formats FormData from object for multipart/form-data requests
 * @param data - Object with form fields
 * @returns FormData instance
 */
export const buildFormData = (data: Record<string, unknown>): FormData => {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return
        }

        if (Array.isArray(value)) {
            value.forEach(item => {
                formData.append(key, String(item))
            })
        } else if (value instanceof File) {
            formData.append(key, value)
        } else {
            formData.append(key, String(value))
        }
    })

    return formData
}

/**
 * Creates standard request headers with tracking information
 * @returns Headers object with metadata
 */
export const createTrackingHeaders = (): Record<string, string> => ({
    'X-QR-Scan': 'true',
    'X-User-Agent': navigator.userAgent,
    'X-Referrer': document.referrer || 'direct',
    'X-Timestamp': new Date().toISOString()
})

/**
 * Wraps async API calls with standardized error handling
 * @param fn - Async function to execute
 * @param errorContext - Context message for error logging
 * @returns Promise with result or throws formatted error
 */
export const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    errorContext: string
): Promise<T> => {
    try {
        return await fn()
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        const contextualError = new Error(`${errorContext}: ${errorMessage}`)

        // Preserve original error stack if available
        if (error instanceof Error && error.stack) {
            contextualError.stack = error.stack
        }

        throw contextualError
    }
}

