/* eslint-disable @typescript-eslint/no-explicit-any */
import { getValidationErrors } from './errorValidation'
import { isAuthenticationError } from './errorAuth'
import { isRateLimitError, getRateLimitInfo } from './errorRateLimit'
import { isNetworkError } from './errorNetwork'
import { logError, getErrorType } from './errorLogger'
import { getUserFriendlyErrorMessage } from './errorMessages'

/**
 * Main error handler class that processes errors and returns structured error information
 */
export class ErrorHandler {
    /**
     * Handles an error and returns structured error information
     */
    static handle(error: any, context?: string): {
        message: string
        type: string
        validationErrors?: Record<string, string>
        retryInfo?: { retryAfter?: number; message: string }
        shouldLogout?: boolean
    } {
        logError(error, context)

        const type = getErrorType(error)
        const message = getUserFriendlyErrorMessage(error, context)
        const validationErrors = getValidationErrors(error)
        const hasValidationErrors = Object.keys(validationErrors).length > 0
        const retryInfo = isRateLimitError(error) ? getRateLimitInfo(error) : undefined
        const shouldLogout = isAuthenticationError(error) && error?.response?.status === 401

        return {
            message,
            type,
            validationErrors: hasValidationErrors ? validationErrors : undefined,
            retryInfo,
            shouldLogout
        }
    }

}

/**
 * Creates a custom error handler with showError and logout callbacks
 */
export const createErrorHandler = (
    showError: (message: string) => void,
    logout?: () => void,
    networkStatus?: { isOnline: boolean }
) => {
    return (error: any, context?: string) => {
        if (networkStatus && !networkStatus.isOnline && isNetworkError(error)) {
            showError('Connection lost. Please check your internet connection.')

            return
        }

        const result = ErrorHandler.handle(error, context)

        if (result.shouldLogout && logout) {
            logout()
            showError(result.message)

            return
        }

        if (result.validationErrors) {
            Object.entries(result.validationErrors).forEach(([field, message]) => {
                showError(`${field}: ${message}`)
            })

            return
        }

        showError(result.message)
    }
}
