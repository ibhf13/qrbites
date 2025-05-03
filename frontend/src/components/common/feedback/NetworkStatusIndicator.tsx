import React, { useEffect } from 'react'
import { useNotificationContext } from '../../../contexts/NotificationContext'
import { useNetworkStatus } from '../../../hooks/useNetworkStatus'
import Badge from './Badge'

interface NetworkStatusIndicatorProps {
    showIndicator?: boolean
    className?: string
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
    showIndicator = true,
    className = '',
}) => {
    const { isOnline, wasOffline } = useNetworkStatus()
    const { showWarning, showSuccess } = useNotificationContext()

    useEffect(() => {
        if (!isOnline) {
            showWarning('You are currently offline. Some features may not work properly.', {
                duration: 0, // Don't auto-dismiss
                title: 'Network Disconnected',
            })
        } else if (wasOffline) {
            showSuccess('Your connection has been restored.', {
                duration: 5000,
                title: 'Back Online',
            })
        }
    }, [isOnline, wasOffline, showWarning, showSuccess])

    if (!showIndicator) return null

    return (
        <div className={`inline-flex items-center ${className}`}>
            <Badge
                color={isOnline ? 'success' : 'error'}
                variant="light"
                size="sm"
                label={isOnline ? 'Online' : 'Offline'}
                icon={
                    isOnline ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                    ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    )
                }
            />
        </div>
    )
}

export default NetworkStatusIndicator 