import { useCallback } from 'react'
import { useNotificationActions } from './useNotifications'
import { NotificationOptions, NotificationSeverity } from '../types/notification.types'

    
export const useNotificationErrorHandler = () => {
    const { showError } = useNotificationActions()

    const handleError = useCallback((error: Error | string | unknown, options?: Omit<NotificationOptions, 'type' | 'message'>) => {
        let message: string

        if (error instanceof Error) {
            message = error.message
        } else if (typeof error === 'string') {
            message = error
        } else {
            message = 'An unexpected error occurred'
        }

        return showError(message, options)
    }, [showError])

    const handleApiError = useCallback((error: { response?: { data?: { message?: string } } } | Error | string, options?: Omit<NotificationOptions, 'type' | 'message'>) => {
        let message: string

        if (typeof error === 'object' && error !== null && 'response' in error) {
            message = error.response?.data?.message || 'API request failed'
        } else if (error instanceof Error) {
            message = error.message
        } else if (typeof error === 'string') {
            message = error
        } else {
            message = 'Network error occurred'
        }

        return showError(message, options)
    }, [showError])

    return {
        handleError,
        handleApiError,
    }
}

export const useToastNotifications = () => {
    const { showSuccess, showError, showWarning, showInfo } = useNotificationActions()

    const showSavedToast = useCallback((message = 'Changes saved successfully') => {
        return showSuccess(message, { duration: 3000 })
    }, [showSuccess])

    const showDeletedToast = useCallback((message = 'Item deleted successfully') => {
        return showSuccess(message, { duration: 3000 })
    }, [showSuccess])

    const showCopiedToast = useCallback((message = 'Copied to clipboard') => {
        return showSuccess(message, { duration: 2000 })
    }, [showSuccess])

    const showNetworkErrorToast = useCallback((message = 'Network connection failed') => {
        return showError(message, { duration: 5000 })
    }, [showError])

    const showValidationErrorToast = useCallback((message = 'Please check your input') => {
        return showWarning(message, { duration: 4000 })
    }, [showWarning])

    const showInfoToast = useCallback((message: string) => {
        return showInfo(message, { duration: 4000 })
    }, [showInfo])

    return {
        showSavedToast,
        showDeletedToast,
        showCopiedToast,
        showNetworkErrorToast,
        showValidationErrorToast,
        showInfoToast,
    }
}

export const useActionNotifications = () => {
    const { showNotification } = useNotificationActions()

    const showUndoNotification = useCallback((
        message: string,
        onUndo: () => void,
        options?: Omit<NotificationOptions, 'type' | 'message' | 'actions'>
    ) => {
        return showNotification({
            type: NotificationSeverity.INFO,
            message,
            actions: [
                {
                    label: 'Undo',
                    onClick: onUndo,
                    variant: 'primary',
                }
            ],
            duration: 8000,
            ...options,
        })
    }, [showNotification])

    const showConfirmationNotification = useCallback((
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
        options?: Omit<NotificationOptions, 'type' | 'message' | 'actions'>
    ) => {
        return showNotification({
            type: NotificationSeverity.WARNING,
            message,
            actions: [
                {
                    label: 'Confirm',
                    onClick: onConfirm,
                    variant: 'primary',
                },
                ...(onCancel ? [{
                    label: 'Cancel',
                    onClick: onCancel,
                    variant: 'secondary' as const,
                }] : [])
            ],
            persistent: true,
            ...options,
        })
    }, [showNotification])

    const showRetryNotification = useCallback((
        message: string,
        onRetry: () => void,
        options?: Omit<NotificationOptions, 'type' | 'message' | 'actions'>
    ) => {
        return showNotification({
            type: NotificationSeverity.ERROR,
            message,
            actions: [
                {
                    label: 'Retry',
                    onClick: onRetry,
                    variant: 'primary',
                }
            ],
            persistent: true,
            ...options,
        })
    }, [showNotification])

    return {
        showUndoNotification,
        showConfirmationNotification,
        showRetryNotification,
    }
} 