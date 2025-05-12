import { useNotificationContext } from '@/contexts/NotificationContext'
import {
    ArrowRightIcon,
    BellIcon,
    CheckCircleIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    TrashIcon,
    XCircleIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

interface NotificationsPanelProps {
    isOpen: boolean
    onClose: () => void
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
    isOpen,
    onClose
}) => {
    const panelRef = useRef<HTMLDivElement>(null)
    const {
        notifications,
        dismissNotification,
        clearAllNotifications
    } = useNotificationContext()

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    // Get notification icon based on type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />
            case 'error':
                return <XCircleIcon className="h-5 w-5 text-red-500" />
            case 'warning':
                return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
            case 'info':
                return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
            default:
                return <BellIcon className="h-5 w-5 text-gray-500" />
        }
    }

    if (!isOpen) return null

    const unreadCount = notifications.length
    const hasNotifications = notifications.length > 0

    return (
        <div
            ref={panelRef}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 
                rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 
                z-50 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-heading"
        >
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                <h3
                    id="notifications-heading"
                    className="text-sm font-medium text-neutral-900 dark:text-neutral-200 flex items-center"
                >
                    Notifications
                    {unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </h3>
                <div className="flex space-x-2">
                    {hasNotifications && (
                        <button
                            className="p-1 text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            onClick={clearAllNotifications}
                            aria-label="Clear all notifications"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        className="p-1 text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        onClick={onClose}
                        aria-label="Close notifications"
                    >
                        <span className="sr-only">Close</span>
                        ×
                    </button>
                </div>
            </div>

            {/* Notification list */}
            <div className="max-h-96 overflow-y-auto">
                {hasNotifications ? (
                    <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {notifications.map((notification) => (
                            <li
                                key={notification.id}
                                className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-750"
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0 mr-3">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {notification.title && (
                                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                                                {notification.title}
                                            </p>
                                        )}
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            {notification.message}
                                        </p>
                                        <div className="mt-1 flex items-center justify-between">
                                            <span className="text-xs text-neutral-500 dark:text-neutral-500">
                                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                            </span>
                                            <button
                                                className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                                                onClick={() => dismissNotification(notification.id)}
                                                aria-label="Dismiss notification"
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-6 text-center">
                        <BellIcon className="mx-auto h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                            No notifications at the moment
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {hasNotifications && (
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
                    <Link
                        to="/notifications"
                        className="flex justify-center items-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        onClick={onClose}
                    >
                        View all notifications
                        <ArrowRightIcon className="ml-1 h-3 w-3" />
                    </Link>
                </div>
            )}
        </div>
    )
}

export default NotificationsPanel 