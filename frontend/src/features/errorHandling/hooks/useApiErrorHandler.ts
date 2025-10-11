/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react'
import { useNotificationContext } from '@/features/notifications/contexts/NotificationContext'
import { ApiErrorResponse, extractRateLimitInfo } from '@/config/api'
import { isValidationError, isRateLimitError, isAuthenticationError } from '@/features/errorHandling/utils/errorUtils'


interface ApiError extends Error {
    response?: {
        status: number
        data: ApiErrorResponse
        headers: Record<string, string>
    }
    code?: string
}
export type GeneralError = ApiError | Error | any

interface UseApiErrorHandlerOptions {
    logout?: () => void
}

export const useApiErrorHandler = (options: UseApiErrorHandlerOptions = {}) => {
    const { logout } = options
    const { showError, showWarning } = useNotificationContext()

    const handleApiError = useCallback((error: GeneralError) => {
        // Log errors appropriately
        if (process.env.NODE_ENV === 'development') {
            console.error('API Error:', error)
        }

        // Handle network errors first
        if (error?.code === 'NETWORK_ERROR' || !error?.response) {
            showError('Network error. Please check your connection and try again.')

            return
        }

        const response = error?.response
        const status = response?.status
        const errorData = response?.data as ApiErrorResponse

        // Handle authentication errors (401)
        if (status === 401) {
            const authErrorMessages = {
                'Not authorized, no token': 'Authentication required. Please log in.',
                'Invalid token': 'Your session is invalid. Please log in again.',
                'Token expired': 'Your session has expired. Please log in again.'
            }

            const message = authErrorMessages[errorData?.error as keyof typeof authErrorMessages]
                || 'Your session has expired. Please log in again.'

            showError(message)
            logout?.()

            return
        }

        // Handle authorization errors (403)
        if (status === 403) {
            // Handle specific 403 authorization error from backend
            if (errorData?.error === 'Not authorized to access this route') {
                showError('You do not have permission to access this resource.')
            } else {
                showError('You do not have permission to perform this action.')
            }

            return
        }

        // Handle rate limiting (429)
        if (status === 429) {
            const rateLimitInfo = extractRateLimitInfo(error)

            // Backend rate limit info:
            // - Headers 'Retry-After' is in seconds
            // - Response body 'retryAfter' is in minutes
            const headerRetryAfterSeconds = rateLimitInfo?.retryAfter // from headers (seconds)
            const bodyRetryAfterMinutes = errorData?.details?.retryAfter // from body (minutes)

            if (bodyRetryAfterMinutes) {
                showWarning(`Too many requests. Please wait ${bodyRetryAfterMinutes} minute${bodyRetryAfterMinutes > 1 ? 's' : ''} and try again.`)
            } else if (headerRetryAfterSeconds) {
                const minutes = Math.ceil(headerRetryAfterSeconds / 60)

                showWarning(`Too many requests. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} and try again.`)
            } else {
                showWarning('Too many requests. Please wait a moment and try again.')
            }

            return
        }

        // Handle validation errors (400 Bad Request or 422 Unprocessable Entity)
        if (status === 400 || status === 422 || isValidationError(errorData)) {
            handleValidationError(errorData)

            return
        }

        // Handle not found errors (404)
        if (status === 404) {
            showError('The requested resource was not found.')

            return
        }

        // Handle conflict errors (409)
        if (status === 409) {
            showError(errorData?.error || 'A conflict occurred. The resource may already exist.')

            return
        }

        // Handle server errors (500+)
        if (status >= 500) {
            if (status === 503) {
                showError('Service is temporarily unavailable. Please try again later.')
            } else {
                showError('A server error occurred. Please try again later.')
            }

            return
        }

        // Handle other HTTP errors with backend error message
        if (errorData?.error) {
            showError(errorData.error)

            return
        }

        // Fallback for unknown errors
        const message = error?.message || 'An unexpected error occurred'

        showError(message)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logout, showError, showWarning])

    const handleValidationError = useCallback((errorData: ApiErrorResponse) => {
        // Show main validation error
        showError(errorData.error || 'Validation failed')

        // Show specific field errors if available
        if (errorData.details && typeof errorData.details === 'object') {
            Object.entries(errorData.details).forEach(([field, message]) => {
                if (typeof message === 'string') {
                    showWarning(`${field}: ${message}`)
                }
            })
        }
    }, [showError, showWarning])

    const handleSecurityError = useCallback((error: GeneralError, operation?: string) => {
        if (process.env.NODE_ENV === 'development') {
            console.error('Security Error:', error, 'Operation:', operation)
        }

        const operationContext = operation ? ` while ${operation}` : ''

        if (isAuthenticationError(error)) {
            const status = error?.response?.status

            if (status === 401) {
                showError(`Authentication failed${operationContext}. Please log in again.`)
                logout?.()
            } else if (status === 403) {
                showError(`Access denied${operationContext}. You do not have permission for this action.`)
            }

            return
        }

        // Fallback to general error handling
        handleApiError(error)
    }, [handleApiError, logout, showError])

    const handleFileUploadError = useCallback((error: GeneralError) => {
        const errorData = error?.response?.data as ApiErrorResponse

        // Handle specific file upload errors
        if (errorData?.error) {
            if (errorData.error.includes('File size')) {
                showError('File size must be less than 5MB.')

                return
            }

            if (errorData.error.includes('File type') || errorData.error.includes('Invalid file')) {
                showError('Invalid file type. Please upload a JPEG or PNG image.')

                return
            }

            if (errorData.error.includes('Too many files')) {
                showError('Too many files. Maximum 10 images allowed for menus.')

                return
            }
        }

        // Fallback to general error handling
        handleApiError(error)
    }, [handleApiError, showError])

    const handleRateLimitError = useCallback((error: GeneralError) => {
        const rateLimitInfo = extractRateLimitInfo(error)
        const errorData = error?.response?.data as ApiErrorResponse

        if (rateLimitInfo) {
            const { remaining, reset, retryAfter: headerRetryAfterSeconds } = rateLimitInfo
            const bodyRetryAfterMinutes = errorData?.details?.retryAfter

            if (bodyRetryAfterMinutes) {
                // Response body retryAfter is in minutes
                showWarning(`Rate limit exceeded. ${remaining} requests remaining. Try again in ${bodyRetryAfterMinutes} minute${bodyRetryAfterMinutes > 1 ? 's' : ''}.`)
            } else if (headerRetryAfterSeconds) {
                // Header retry-after is in seconds
                const minutes = Math.ceil(headerRetryAfterSeconds / 60)

                showWarning(`Rate limit exceeded. ${remaining} requests remaining. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`)
            } else if (reset) {
                const resetTime = new Date(reset * 1000)
                const now = new Date()
                const waitMinutes = Math.ceil((resetTime.getTime() - now.getTime()) / 60000)

                showWarning(`Rate limit exceeded. Try again in ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''}.`)
            } else {
                showWarning('Rate limit exceeded. Please wait before making more requests.')
            }
        } else {
            showWarning(errorData?.error || 'Too many requests. Please wait and try again.')
        }
    }, [showWarning])

    // Helper function to extract user-friendly error messages
    const getErrorMessage = useCallback((error: GeneralError): string => {
        const errorData = error?.response?.data as ApiErrorResponse

        if (errorData?.error) {
            return errorData.error
        }

        if (error?.message) {
            return error.message
        }

        return 'An unexpected error occurred'
    }, [])

    // Helper function to check if error has validation details
    const hasValidationDetails = useCallback((error: GeneralError): boolean => {
        const errorData = error?.response?.data as ApiErrorResponse

        return isValidationError(errorData)
    }, [])

    // Helper function to get validation field errors
    const getValidationErrors = useCallback((error: GeneralError): Record<string, string> => {
        const errorData = error?.response?.data as ApiErrorResponse

        if (isValidationError(errorData) && errorData.details) {
            return errorData.details as Record<string, string>
        }

        return {}
    }, [])

    return {
        handleApiError,
        handleSecurityError,
        handleValidationError,
        handleFileUploadError,
        handleRateLimitError,
        getErrorMessage,
        hasValidationDetails,
        getValidationErrors,

        // Utility functions for error checking
        isAuthenticationError,
        isRateLimitError,
        isValidationError: (error: GeneralError) => isValidationError(error?.response?.data)
    }
}

export default useApiErrorHandler