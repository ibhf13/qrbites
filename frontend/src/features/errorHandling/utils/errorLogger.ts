/* eslint-disable @typescript-eslint/no-explicit-any */
import { isApiErrorResponse } from './errorHttp'
import { isValidationError, getValidationErrors } from './errorValidation'
import { isAuthenticationError, isAuthorizationError } from './errorAuth'
import { isRateLimitError, getRateLimitInfo } from './errorRateLimit'
import { isNetworkError, isServerError } from './errorNetwork'

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

/**
 * Gets error severity based on error type
 */
export const getErrorSeverity = (response: any): ErrorSeverity => {
    if (isAuthenticationError(response) || isAuthorizationError(response)) return 'critical'
    if (isServerError(response) || isNetworkError(response)) return 'high'
    if (isValidationError(response)) return 'medium'
    if (isRateLimitError(response)) return 'low'

    return 'medium'
}

/**
 * Gets error type classification
 */
export const getErrorType = (error: any): string => {
    if (isNetworkError(error)) return 'NETWORK_ERROR'
    if (isAuthenticationError(error)) return 'AUTH_ERROR'
    if (isAuthorizationError(error)) return 'AUTHORIZATION_ERROR'
    if (isRateLimitError(error)) return 'RATE_LIMIT_ERROR'
    if (isValidationError(error)) return 'VALIDATION_ERROR'
    if (isServerError(error)) return 'SERVER_ERROR'
    if (isApiErrorResponse(error)) return 'API_ERROR'

    return 'UNKNOWN_ERROR'
}

/**
 * Logs error details in development mode
 */
export const logError = (error: any, context?: string): void => {
    if (process.env.NODE_ENV === 'development') {
        console.group(`🛠️ Error ${context ? `in ${context}` : ''}`)
        console.error('Error:', error)
        console.error('Type:', getErrorType(error))
        console.error('Severity:', getErrorSeverity(error))

        const validationErrors = getValidationErrors(error)

        if (Object.keys(validationErrors).length > 0) {
            console.error('Validation errors:', validationErrors)
        }

        if (isRateLimitError(error)) {
            console.error('Rate limit info:', getRateLimitInfo(error))
        }

        console.groupEnd()
    }
}

/**
 * Logs API error details in development mode
 */
export const logApiError = (response: any, context?: string): void => {
    if (process.env.NODE_ENV === 'development') {
        const apiError = isApiErrorResponse(response) ? response : response?.response?.data

        console.group(`🛠️ API Error${context ? ` (${context})` : ''}`)
        console.error('Error:', apiError?.error || response?.message || 'Unknown error')

        if (apiError?.details) {
            console.error('Details:', apiError.details)
        }

        console.error('Severity:', getErrorSeverity(response))
        console.error('Type:', {
            validation: isValidationError(response),
            auth: isAuthenticationError(response),
            authorization: isAuthorizationError(response),
            rateLimit: isRateLimitError(response),
            network: isNetworkError(response),
            server: isServerError(response)
        })

        if (isRateLimitError(response)) {
            console.error('Rate limit info:', getRateLimitInfo(response))
        }

        console.groupEnd()
    }
}

/**
 * Creates a React Query error handler with logging
 */
export const createReactQueryErrorHandler = (onError?: (error: any) => void) => {
    return (error: any) => {
        logApiError(error, 'React Query')
        if (onError) onError(error)

        return error
    }
}
