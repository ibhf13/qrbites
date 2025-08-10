import { Notification } from '../types/notification.types'


export const safeJsonParse = <T>(jsonString: string | null, fallback: T): T => {
    if (!jsonString) return fallback

    try {
        return JSON.parse(jsonString) as T
    } catch (error) {
        console.error('Failed to parse JSON from localStorage:', error)

        return fallback
    }
}


export const safeJsonStringify = <T>(value: T): string | null => {
    try {
        return JSON.stringify(value)
    } catch (error) {
        console.error('Failed to stringify value for localStorage:', error)

        return null
    }
}


export interface SerializableNotification extends Omit<Notification, 'onDismiss' | 'onShow' | 'actions'> {
    readonly actionLabels?: readonly string[]
}

export const serializeNotification = (notification: Notification): SerializableNotification => {
    const { actions, ...serializableProps } = notification

    return {
        ...serializableProps,
        actionLabels: actions?.map(action => action.label)
    }
}


export const deserializeNotification = (serialized: SerializableNotification): Notification => {
    const { actionLabels, ...props } = serialized

    return {
        ...props,
        onDismiss: undefined,
        onShow: undefined,
        actions: actionLabels?.map(label => ({
            label,
            onClick: () => { },
            disabled: true
        }))
    }
}


export const isValidStoredNotification = (obj: SerializableNotification): obj is SerializableNotification => {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        typeof obj.message === 'string' &&
        typeof obj.type === 'string' &&
        typeof obj.timestamp === 'number' &&
        obj.timestamp > 0
    )
}


export const cleanupStoredNotifications = (
    notifications: SerializableNotification[],
    maxAge: number = 7 * 24 * 60 * 60 * 1000,
    maxCount: number = 50
): SerializableNotification[] => {
    const now = Date.now()

    return notifications
        .filter(isValidStoredNotification)
        .filter(notification => (now - notification.timestamp) < maxAge)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, maxCount)
}


export const STORAGE_KEYS = {
    NOTIFICATIONS: 'qrbites_notifications',
    NOTIFICATION_SETTINGS: 'qrbites_notification_settings'
} as const


export const STORAGE_CONFIG = {
    MAX_STORED_NOTIFICATIONS: 50,
    MAX_STORAGE_AGE_MS: 7 * 24 * 60 * 60 * 1000,
    CLEANUP_INTERVAL_MS: 60 * 60 * 1000,
} as const