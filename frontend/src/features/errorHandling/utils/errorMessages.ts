/* eslint-disable @typescript-eslint/no-explicit-any */
import { isApiErrorResponse } from './errorHttp'
import { isValidationError, getValidationErrors } from './errorValidation'
import { isAuthenticationError, getAuthErrorMessage, getContextAuthErrorMessage } from './errorAuth'
import { isAuthorizationError } from './errorAuth'
import { isRateLimitError, getRateLimitInfo } from './errorRateLimit'
import { isFileUploadError, getFileUploadErrorMessage } from './errorFileUpload'
import { isNetworkError, getNetworkErrorMessage } from './errorNetwork'
import { isServerError } from './errorNetwork'
import { getHttpStatusMessage } from './errorHttp'
import { getContextErrorMessage } from './errorContext'

/**
 * Gets the first validation error message
 */
const getFirstValidationError = (response: any): string | null => {
    const errors = getValidationErrors(response)
    const firstKey = Object.keys(errors)[0]

    return firstKey ? errors[firstKey] : null
}

/**
 * Gets user-friendly error message based on error type and context
 */
export const getUserFriendlyErrorMessage = (response: any, context?: string): string => {
    if (isNetworkError(response)) {
        return getNetworkErrorMessage(response)
    }

    let apiError: any = null

    if (isApiErrorResponse(response)) {
        apiError = response
    } else if (response?.response?.data && isApiErrorResponse(response.response.data)) {
        apiError = response.response.data
    }

    if (apiError) {
        // Authentication errors
        if (isAuthenticationError(apiError)) {
            return getAuthErrorMessage(apiError)
        }

        // Authorization errors
        if (isAuthorizationError(apiError)) {
            return 'You do not have permission to perform this action.'
        }

        // Rate limiting errors
        if (isRateLimitError(apiError)) {
            return getRateLimitInfo(apiError).message
        }

        // File upload errors
        if (isFileUploadError(apiError)) {
            return getFileUploadErrorMessage(apiError)
        }

        // Validation errors
        if (isValidationError(apiError)) {
            const firstError = getFirstValidationError(apiError)

            return firstError || 'Please check your input and try again.'
        }

        // Context-specific messages
        if (context) {
            const contextMessage = getContextErrorMessage(context)

            if (contextMessage) return contextMessage

            const authContextMessage = getContextAuthErrorMessage(apiError.error, context)

            if (authContextMessage) return authContextMessage
        }

        return apiError.error
    }

    // Handle server errors
    if (isServerError(response)) {
        return 'Server is currently unavailable. Please try again later.'
    }

    // Handle HTTP status codes
    const status = response?.response?.status || response?.status

    if (status) {
        return getHttpStatusMessage(status)
    }

    if (response instanceof Error) return response.message

    return 'An unexpected error occurred. Please try again.'
}
