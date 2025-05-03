import { useSnackbar, VariantType } from 'notistack'

interface NotificationOptions {
    variant?: VariantType
    autoHideDuration?: number
}

export const useNotification = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const showNotification = (
        message: string,
        options: NotificationOptions = {}
    ) => {
        const { variant = 'default', autoHideDuration = 5000 } = options

        return enqueueSnackbar(message, {
            variant,
            autoHideDuration,
        })
    }

    const showSuccess = (message: string, options: Omit<NotificationOptions, 'variant'> = {}) => {
        return showNotification(message, { ...options, variant: 'success' })
    }

    const showError = (message: string, options: Omit<NotificationOptions, 'variant'> = {}) => {
        return showNotification(message, { ...options, variant: 'error' })
    }

    const showInfo = (message: string, options: Omit<NotificationOptions, 'variant'> = {}) => {
        return showNotification(message, { ...options, variant: 'info' })
    }

    const showWarning = (message: string, options: Omit<NotificationOptions, 'variant'> = {}) => {
        return showNotification(message, { ...options, variant: 'warning' })
    }

    return {
        showNotification,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        closeSnackbar,
    }
} 