import { Notification } from '../types/notification.types'

/**
 * Storage utilities for notification persistence
 */

/**
 * Safe JSON parsing with error handling
 */
export const safeJsonParse = <T>(jsonString: string | null, fallback: T): T => {
    if (!jsonString) return fallback

    try {
        return JSON.parse(jsonString) as T
    } catch (error) {
        console.error('Failed to parse JSON from localStorage:', error)
        return fallback
    }
}

/**
 * Safe JSON stringification with error handling
 */
export const safeJsonStringify = (value: any): string | null => {
    try {
        return JSON.stringify(value)
    } catch (error) {
        console.error('Failed to stringify value for localStorage:', error)
        return null
    }
}

/**
 * Serializable notification interface for storage
 * Removes function properties that can't be serialized
 */
export interface SerializableNotification extends Omit<Notification, 'onDismiss' | 'onShow' | 'actions'> {
    // Store action labels only for display purposes
    readonly actionLabels?: readonly string[]
}

/**
 * Convert a notification to a serializable format for storage
 */
export const serializeNotification = (notification: Notification): SerializableNotification => {
    const { onDismiss, onShow, actions, ...serializableProps } = notification

    return {
        ...serializableProps,
        actionLabels: actions?.map(action => action.label)
    }
}

/**
 * Convert a serializable notification back to a full notification
 * Note: Functions (onDismiss, onShow, action handlers) will be undefined
 */
export const deserializeNotification = (serialized: SerializableNotification): Notification => {
    const { actionLabels, ...props } = serialized

    return {
        ...props,
        // Functions are lost during serialization, will need to be re-attached if needed
        onDismiss: undefined,
        onShow: undefined,
        actions: actionLabels?.map(label => ({
            label,
            onClick: () => { }, // Placeholder function
            disabled: true // Mark as disabled since functionality is lost
        }))
    }
}

/**
 * Validate that a stored notification has required properties
 */
export const isValidStoredNotification = (obj: any): obj is SerializableNotification => {
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

/**
 * Clean up stored notifications by removing invalid entries and old entries
 */
export const cleanupStoredNotifications = (
    notifications: any[],
    maxAge: number = 7 * 24 * 60 * 60 * 1000, // 7 days
    maxCount: number = 50
): SerializableNotification[] => {
    const now = Date.now()

    return notifications
        .filter(isValidStoredNotification) // Remove invalid entries
        .filter(notification => (now - notification.timestamp) < maxAge) // Remove old entries
        .sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
        .slice(0, maxCount) // Limit count
}

/**
 * Storage key constants
 */
export const STORAGE_KEYS = {
    NOTIFICATIONS: 'qrbites_notifications',
    NOTIFICATION_SETTINGS: 'qrbites_notification_settings'
} as const

/**
 * Storage configuration
 */
export const STORAGE_CONFIG = {
    MAX_STORED_NOTIFICATIONS: 50,
    MAX_STORAGE_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
    CLEANUP_INTERVAL_MS: 60 * 60 * 1000, // 1 hour
} as const