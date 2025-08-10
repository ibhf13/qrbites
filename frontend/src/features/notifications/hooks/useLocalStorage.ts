import { useState, useEffect, useCallback } from 'react'

export const useLocalStorage = <T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {

    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            if (typeof window === 'undefined') {
                return initialValue
            }

            const item = window.localStorage.getItem(key)

            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error)

            return initialValue
        }
    })

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value

            setStoredValue(valueToStore)

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore))
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error)
        }
    }, [key, storedValue])

    const clearValue = useCallback(() => {
        try {
            setStoredValue(initialValue)

            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key)
            }
        } catch (error) {
            console.error(`Error clearing localStorage key "${key}":`, error)
        }
    }, [key, initialValue])

    return [storedValue, setValue, clearValue]
}

export const useNotificationStorage = (
    maxStoredNotifications: number = 50,
    maxStorageAge: number = 7 * 24 * 60 * 60 * 1000
) => {
    const STORAGE_KEY = 'qrbites_notifications'

    const [notifications, setNotifications, clearNotifications] = useLocalStorage<Record<string, unknown>[]>(STORAGE_KEY, [])

    const cleanupNotifications = useCallback((notificationList: Record<string, unknown>[]) => {
        const now = Date.now()

        const recentNotifications = notificationList.filter(
            notification => {
                const timestamp = notification.timestamp as number

                return timestamp && (now - timestamp) < maxStorageAge
            }
        )

        return recentNotifications
            .sort((a, b) => {
                const timestampA = a.timestamp as number
                const timestampB = b.timestamp as number

                return timestampB - timestampA
            })
            .slice(0, maxStoredNotifications)
    }, [maxStorageAge, maxStoredNotifications])

    const setNotificationsWithCleanup = useCallback((value: Record<string, unknown>[] | ((prev: Record<string, unknown>[]) => Record<string, unknown>[])) => {
        const newValue = typeof value === 'function' ? value(notifications) : value
        const cleanedValue = cleanupNotifications(newValue)

        setNotifications(cleanedValue)
    }, [notifications, setNotifications, cleanupNotifications])

    useEffect(() => {
        const cleanedNotifications = cleanupNotifications(notifications)

        if (cleanedNotifications.length !== notifications.length) {
            setNotifications(cleanedNotifications)
        }
    }, [cleanupNotifications, notifications, setNotifications])

    return [notifications, setNotificationsWithCleanup, clearNotifications] as const
}