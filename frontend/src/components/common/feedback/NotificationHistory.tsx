import React, { useState } from 'react'
import { useNotificationContext } from '../../../contexts/NotificationContext'
import Badge from './Badge'

interface NotificationHistoryProps {
    maxItems?: number
    className?: string
}

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({
    maxItems = 10,
    className = '',
}) => {
    const { notifications, clearAllNotifications } = useNotificationContext()
    const [isOpen, setIsOpen] = useState(false)

    // Show notifications in reverse chronological order (newest first)
    const sortedNotifications = [...notifications]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, maxItems)

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                )
            case 'error':
                return (
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )
            case 'warning':
                return (
                    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                )
            case 'info':
            default:
                return (
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
        }
    }

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    if (notifications.length === 0) {
        return null
    }

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                aria-expanded={isOpen}
                aria-label="View notification history"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                    <Badge
                        color="error"
                        variant="filled"
                        size="sm"
                        label={notifications.length.toString()}
                        className="absolute -top-1 -right-1"
                    />
                )}
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 right-0 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                        <button
                            onClick={clearAllNotifications}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            Clear all
                        </button>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedNotifications.length > 0 ? (
                            sortedNotifications.map((notification) => (
                                <div key={notification.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-0.5 mr-2">
                                                {getTypeIcon(notification.type)}
                                            </div>
                                            <div>
                                                {notification.title && (
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                                                )}
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{notification.message}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatTime(notification.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                No notifications yet
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationHistory 