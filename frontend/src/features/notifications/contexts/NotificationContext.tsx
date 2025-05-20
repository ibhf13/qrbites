import { SnackbarKey, SnackbarOrigin, useSnackbar, VariantType } from 'notistack'
import React, { createContext, ReactNode, useCallback, useContext, useState, useMemo } from 'react'
import {
    Notification,
    NotificationContextValue,
    NotificationOptions,
    NotificationSeverity,
    NotificationPosition
} from '../types/notification.types'
import {
    DEFAULT_NOTIFICATION_CONFIG,
    NOTIFICATION_SEVERITY_CONFIG,
    POSITION_MAPPING,
    NOTIFICATION_UI,
    NOTIFICATION_ERRORS
} from '../constants/notification.constants'

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

interface NotificationProviderProps {
    children: ReactNode
    maxNotifications?: number
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
    maxNotifications = NOTIFICATION_UI.MAX_HISTORY_ITEMS
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const generateId = useCallback((): string => {
        return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }, [])

    const mapPositionToNotistack = useCallback((position?: NotificationPosition): SnackbarOrigin => {
        if (position && position in POSITION_MAPPING) {
            return POSITION_MAPPING[position]
        }

        return POSITION_MAPPING[DEFAULT_NOTIFICATION_CONFIG.position]
    }, [])

    const getNotificationById = useCallback((id: string): Notification | undefined => {
        return notifications.find(notification => notification.id === id)
    }, [notifications])

    const dismissNotification = useCallback((id: string) => {
        const notification = getNotificationById(id)

        if (notification) {
            setNotifications(prev => prev.filter(n => n.id !== id))
            closeSnackbar(id)
            notification.onDismiss?.()
        }
    }, [getNotificationById, closeSnackbar])

    const clearAllNotifications = useCallback(() => {
        notifications.forEach(notification => {
            notification.onDismiss?.()
        })
        setNotifications([])
        closeSnackbar()
    }, [notifications, closeSnackbar])

    const showNotification = useCallback((options: NotificationOptions): string => {
        if (!options.message?.trim()) {
            throw new Error(NOTIFICATION_ERRORS.MISSING_MESSAGE)
        }

        const id = generateId()

        const config = {
            ...DEFAULT_NOTIFICATION_CONFIG,
            ...NOTIFICATION_SEVERITY_CONFIG[options.type],
            ...options
        }

        const newNotification: Notification = {
            id,
            timestamp: Date.now(),
            type: config.type,
            message: config.message,
            title: config.title,
            duration: config.duration,
            dismissible: config.dismissible,
            position: config.position,
            persistent: config.persistent,
            maxWidth: config.maxWidth,
            showProgress: config.showProgress,
            actions: config.actions,
            onDismiss: config.onDismiss,
            onShow: config.onShow,
        }

        setNotifications(prev => {
            const updated = [newNotification, ...prev]

            return updated.slice(0, maxNotifications)
        })

        enqueueSnackbar(newNotification.message, {
            key: id,
            variant: newNotification.type as VariantType,
            autoHideDuration: newNotification.persistent ? null : (newNotification.duration || 5000),
            anchorOrigin: mapPositionToNotistack(newNotification.position),
            preventDuplicate: true,
            persist: newNotification.persistent,
            onClose: (_, reason) => {
                if (reason !== 'instructed') {
                    dismissNotification(id)
                }
            },
            action: newNotification.actions?.length
                ? (key: SnackbarKey) => {
                    const { FlexBox } = require('@/components/common')

                    return (
                        <FlexBox gap="sm">
                            {newNotification.actions?.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (!action.disabled) {
                                            action.onClick()
                                            closeSnackbar(key)
                                        }
                                    }}
                                    disabled={action.disabled}
                                    className={`text-xs font-medium underline hover:text-opacity-80 ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </FlexBox>
                    )
                }
                : undefined,
        })

        newNotification.onShow?.()

        return id
    }, [generateId, mapPositionToNotistack, maxNotifications, enqueueSnackbar, closeSnackbar, dismissNotification])

    const showSuccess = useCallback((message: string, options?: Omit<NotificationOptions, 'type' | 'message'>): string => {
        return showNotification({ type: NotificationSeverity.SUCCESS, message, ...options })
    }, [showNotification])

    const showError = useCallback((message: string, options?: Omit<NotificationOptions, 'type' | 'message'>): string => {
        return showNotification({ type: NotificationSeverity.ERROR, message, ...options })
    }, [showNotification])

    const showWarning = useCallback((message: string, options?: Omit<NotificationOptions, 'type' | 'message'>): string => {
        return showNotification({ type: NotificationSeverity.WARNING, message, ...options })
    }, [showNotification])

    const showInfo = useCallback((message: string, options?: Omit<NotificationOptions, 'type' | 'message'>): string => {
        return showNotification({ type: NotificationSeverity.INFO, message, ...options })
    }, [showNotification])

    const contextValue = useMemo<NotificationContextValue>(() => ({
        notifications,
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismissNotification,
        clearAllNotifications,
        getNotificationById,
    }), [
        notifications,
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismissNotification,
        clearAllNotifications,
        getNotificationById,
    ])

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotificationContext = (): NotificationContextValue => {
    const context = useContext(NotificationContext)

    if (!context) {
        throw new Error(NOTIFICATION_ERRORS.CONTEXT_NOT_FOUND)
    }

    return context
} 