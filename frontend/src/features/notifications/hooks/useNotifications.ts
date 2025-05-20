import { useNotificationContext } from '@/features/notifications/contexts/NotificationContext'
import { NotificationActions, NotificationState } from '../types/notification.types'
import { useMemo } from 'react'


export const useNotifications = () => {
    const context = useNotificationContext()

    return {
        notifications: context.notifications,
        showNotification: context.showNotification,
        showSuccess: context.showSuccess,
        showError: context.showError,
        showWarning: context.showWarning,
        showInfo: context.showInfo,
        dismissNotification: context.dismissNotification,
        clearAllNotifications: context.clearAllNotifications,
        getNotificationById: context.getNotificationById,
    }
}

export const useNotificationActions = (): NotificationActions => {
    const context = useNotificationContext()

    return {
        showNotification: context.showNotification,
        showSuccess: context.showSuccess,
        showError: context.showError,
        showWarning: context.showWarning,
        showInfo: context.showInfo,
        dismissNotification: context.dismissNotification,
        clearAllNotifications: context.clearAllNotifications,
    }
}

    
export const useNotificationState = (): NotificationState => {
    const context = useNotificationContext()

    return useMemo(() => ({
        notifications: context.notifications,
        hasNotifications: context.notifications.length > 0,
        unreadCount: context.notifications.length,
        getNotificationById: context.getNotificationById,
    }), [context.notifications, context.getNotificationById])
} 