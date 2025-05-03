import { AxiosError } from 'axios'
import { useCallback } from 'react'
import { useNotificationContext } from '../contexts/NotificationContext'

interface ApiErrorOptions {
    fallbackMessage?: string
    showNotification?: boolean
    logError?: boolean
    title?: string
}

interface ValidationErrors {
    [fieldName: string]: string[]
}

const defaultOptions: ApiErrorOptions = {
    fallbackMessage: 'An unexpected error occurred',
    showNotification: true,
    logError: true,
    title: 'Error'
}

export const useApiErrorHandler = () => {
    const { showError } = useNotificationContext()

    const handleApiError = useCallback((
        error: unknown,
        options: ApiErrorOptions = {}
    ) => {
        const finalOptions = { ...defaultOptions, ...options }

        if (finalOptions.logError) {
            console.error('API Error:', error)
        }

        // Handle Axios errors specifically
        if (error instanceof AxiosError) {
            const status = error.response?.status
            const data = error.response?.data

            // Handle different status codes
            if (status === 401) {
                if (finalOptions.showNotification) {
                    showError('Your session has expired. Please log in again.', {
                        title: 'Authentication Error'
                    })
                }
                // Could trigger a logout action here
                return 'authentication_error'
            }

            // Handle validation errors (usually 422)
            if (status === 422 && data?.errors) {
                const validationErrors = data.errors as ValidationErrors

                // Count total errors
                const totalErrors = Object.values(validationErrors).reduce(
                    (count, fieldErrors) => count + fieldErrors.length, 0
                )

                if (finalOptions.showNotification) {
                    const errorMsg = `Please correct the ${totalErrors} ${totalErrors === 1 ? 'error' : 'errors'} in your submission.`
                    showError(errorMsg, { title: 'Validation Error' })
                }

                return {
                    type: 'validation_error',
                    errors: validationErrors
                }
            }

            // Generic error with message from response
            if (data?.message && finalOptions.showNotification) {
                const message = typeof data.message === 'string' ? data.message : String(data.message)
                showError(message, {
                    title: finalOptions.title || 'Error'
                })
                return 'api_error'
            }
        }

        // For all other errors, show a generic message
        if (finalOptions.showNotification) {
            showError(finalOptions.fallbackMessage || 'An unexpected error occurred', {
                title: finalOptions.title || 'Error'
            })
        }

        return 'unknown_error'
    }, [showError])

    return { handleApiError }
}

export default useApiErrorHandler 