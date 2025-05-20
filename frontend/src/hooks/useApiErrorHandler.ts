/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react'
import { useAuthContext } from '@/features/auth/contexts/AuthContext'
import { useNotificationContext } from '@/features/notifications/contexts/NotificationContext'


interface ApiError {
    message: string
    code?: string
    status?: number
}

export const useApiErrorHandler = () => {
    const { logout } = useAuthContext()
    const { showError } = useNotificationContext()

    const handleApiError = useCallback((error: ApiError | Error | any) => {
        console.error('API Error:', error)

        if (error?.response?.status === 401) {
            showError('Your session has expired. Please log in again.')
            logout()

            return
        }

        if (error?.response?.status === 403) {
            showError('You do not have permission to perform this action.')

            return
        }

        if (error?.response?.status === 404) {
            showError('The requested resource was not found.')

            return
        }

        if (error?.response?.status === 429) {
            showError('Too many requests. Please wait a moment and try again.')

            return
        }

        if (error?.response?.status >= 500) {
            showError('A server error occurred. Please try again later.')

            return
        }

        if (error?.code === 'NETWORK_ERROR' || !error?.response) {
            showError('Network error. Please check your connection and try again.')

            return
        }

        if (error?.response?.data) {
            const errorData = error.response.data
            const message = errorData.message || errorData.error?.message || 'An error occurred'

            showError(message)

            return
        }

        const message = error?.message || 'An unexpected error occurred'

        showError(message)
    }, [logout, showError])

    const handleSecurityError = useCallback((error: ApiError | Error | any, operation?: string) => {
        console.error('Security Error:', error, 'Operation:', operation)

        const operationContext = operation ? ` while ${operation}` : ''

        if (error?.response?.status === 401) {
            showError(`Authentication failed${operationContext}. Please log in again.`)
            logout()

            return
        }

        if (error?.response?.status === 403) {
            showError(`Access denied${operationContext}. You do not have permission for this action.`)

            return
        }

        handleApiError(error)
    }, [handleApiError, logout, showError])

    const handleValidationError = useCallback((error: any) => {
        if (error?.response?.data?.errors) {
            const errors = error.response.data.errors

            if (Array.isArray(errors)) {
                errors.forEach((err: any) => {
                    showError(err.message || err)
                })

                return
            }
        }

        const message = error?.response?.data?.message || 'Validation failed'

        showError(message)
    }, [showError])

    return {
        handleApiError,
        handleSecurityError,
        handleValidationError
    }
}

export default useApiErrorHandler 