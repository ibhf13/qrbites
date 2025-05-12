import { SnackbarKey, SnackbarOrigin, useSnackbar, VariantType } from 'notistack'
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react'

export interface NotificationOptions {
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    title?: string
    duration?: number // ms, default 5000
    dismissible?: boolean // default true
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
    onDismiss?: () => void
    actions?: Array<{
        label: string
        onClick: () => void
    }>
}

interface Notification extends NotificationOptions {
    id: string
    timestamp: number
}

interface NotificationContextValue {
    notifications: Notification[]
    showNotification: (options: NotificationOptions) => string
    showSuccess: (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => string
    showError: (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => string
    showWarning: (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => string
    showInfo: (message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) => string
    dismissNotification: (id: string) => void
    clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const mapPositionToNotistack = (position?: NotificationOptions['position']): SnackbarOrigin => {
        switch (position) {
            case 'top-right':
                return { vertical: 'top', horizontal: 'right' }
            case 'top-left':
                return { vertical: 'top', horizontal: 'left' }
            case 'bottom-right':
                return { vertical: 'bottom', horizontal: 'right' }
            case 'bottom-left':
                return { vertical: 'bottom', horizontal: 'left' }
            case 'top-center':
                return { vertical: 'top', horizontal: 'center' }
            case 'bottom-center':
                return { vertical: 'bottom', horizontal: 'center' }
            default:
                return { vertical: 'top', horizontal: 'right' }
        }
    }

    const dismissNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
        closeSnackbar(id)
    }, [closeSnackbar])

    const clearAllNotifications = useCallback(() => {
        setNotifications([])
        closeSnackbar()
    }, [closeSnackbar])

    const showNotification = useCallback((options: NotificationOptions): string => {
        const id = Math.random().toString(36).substring(2, 11)
        const newNotification: Notification = {
            id,
            timestamp: Date.now(),
            ...options,
        }

        setNotifications((prev) => [...prev, newNotification])

        enqueueSnackbar(options.message, {
            key: id,
            variant: options.type as VariantType,
            autoHideDuration: options.duration || 3000,
            anchorOrigin: mapPositionToNotistack(options.position),
            preventDuplicate: true,
            persist: false,
            onClose: (_, reason) => {
                if (reason !== 'instructed') {
                    dismissNotification(id)
                    if (options.onDismiss) {
                        options.onDismiss()
                    }
                }
            },
            action: options.actions
                ? (key: SnackbarKey) => (
                    <div className="flex space-x-2">
                        {options.actions?.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    action.onClick()
                                    closeSnackbar(key)
                                }}
                                className="text-xs font-medium underline hover:text-opacity-80"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )
                : undefined,
        })

        return id
    }, [enqueueSnackbar, closeSnackbar, dismissNotification])

    const showSuccess = useCallback((message: string, options?: Omit<NotificationOptions, 'type' | 'message'>): string => {
        return showNotification({ type: 'success', message, ...options })
    }, [showNotification])

    const showError = useCallback((message: string, options?: Omit<NotificationOptions, 'type' | 'message'>): string => {
        return showNotification({ type: 'error', message, ...options })
    }, [showNotification])

    const showWarning = useCallback((message: string, options?: Omit<NotificationOptions, 'type' | 'message'>): string => {
        return showNotification({ type: 'warning', message, ...options })
    }, [showNotification])

    const showInfo = useCallback((message: string, options?: Omit<NotificationOptions, 'type' | 'message'>): string => {
        return showNotification({ type: 'info', message, ...options })
    }, [showNotification])

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                showNotification,
                showSuccess,
                showError,
                showWarning,
                showInfo,
                dismissNotification,
                clearAllNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotificationContext = (): NotificationContextValue => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotificationContext must be used within a NotificationProvider')
    }
    return context
} 